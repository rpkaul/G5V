<template>
  <v-container class="match-info-cockpit pa-6" fluid>
    <v-row justify="center" align="center" class="mb-8">
      <!-- Team 1 -->
      <v-col cols="12" md="4" class="text-center">
        <router-link :to="'/teams/' + matchInfo.team1_id" class="text-decoration-none link-glow">
          <v-avatar size="100" class="neon-halo mb-4">
            <v-img 
              :src="matchInfo.team1.logo ? apiUrl + '/static/img/logos/' + matchInfo.team1.logo + '.png' : get_flag_link(matchInfo.team1)" 
              @error="imgUrlAlt"
            />
          </v-avatar>
          <h3 class="team-name font-orbitron white--text">{{ matchInfo.team1_name }}</h3>
        </router-link>
      </v-col>

      <!-- Score & Status -->
      <v-col cols="12" md="4" class="text-center">
        <div class="score-container mb-2">
          <span class="score-value">{{ matchInfo.team1_score }}</span>
          <span class="score-divider mx-4">:</span>
          <span class="score-value">{{ matchInfo.team2_score }}</span>
        </div>
        <v-chip :color="getStatusColor" label outlined small class="status-chip mb-4">
          {{ getStatusLabel }}
        </v-chip>
        <div class="match-meta grey--text text-caption font-weight-bold">
          <div>{{ matchInfo.start_time }}</div>
          <div v-if="matchInfo.match_title">{{ matchInfo.match_title }}</div>
        </div>
      </v-col>

      <!-- Team 2 -->
      <v-col cols="12" md="4" class="text-center">
        <router-link :to="'/teams/' + matchInfo.team2_id" class="text-decoration-none link-glow">
          <v-avatar size="100" class="neon-halo mb-4">
            <v-img 
              :src="matchInfo.team2.logo ? apiUrl + '/static/img/logos/' + matchInfo.team2.logo + '.png' : get_flag_link(matchInfo.team2)" 
              @error="imgUrlAlt"
            />
          </v-avatar>
          <h3 class="team-name font-orbitron white--text">{{ matchInfo.team2_name }}</h3>
        </router-link>
      </v-col>
    </v-row>

    <!-- Connect Buttons -->
    <v-row justify="center" v-if="user.id != null && user.id != -1 && serverInfo.ip_string != '' && matchInfo.end_time == null">
      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          class="black--text font-weight-black mx-2 pulse-btn"
          rounded
          :href="'steam://rungame/730/' + user.steam_id + '/+connect%20' + serverInfo.ip_string + ':' + serverInfo.port"
        >
          <v-icon left>mdi-play</v-icon>
          {{ $t("Match.Connect") }}
        </v-btn>
        <v-btn
          v-if="serverInfo.gotv_port"
          color="secondary"
          class="mx-2"
          rounded
          outlined
          :href="'steam://rungame/730/' + user.steam_id + '/+connect%20' + serverInfo.ip_string + ':' + serverInfo.gotv_port"
        >
          <v-icon left>mdi-eye</v-icon>
          {{ $t("Match.GOTVConnect") }}
        </v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-8 opacity-10" />

    <!-- Admin Controls Section -->
    <v-row v-if="matchInfo.id !== -1 && AdminToolsAvailable(matchInfo) && !matchInfo.end_time && !matchInfo.cancelled">
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon color="primary" class="mr-2">mdi-cog</v-icon>
          <span class="font-orbitron white--text subtitle-1">{{ $t("MatchAdmin.AdminTools") }}</span>
        </div>
        <AdminButton
          :matchInfo="matchInfo"
          :user="user"
          layout="tiles"
          @force-the-reload="getMatchInfo()"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AdminButton from "./MatchAdminButton";
export default {
  components: {
    AdminButton
  },
  props: {
    match_id: Number,
    user: Object
  },
  sse: {
    cleanup: true
  },
  data() {
    return {
      matchInfo: {
        team1_name: "",
        team2_name: "",
        match_title: "",
        start_time: "",
        end_time: "",
        team1_id: 0,
        team2_id: 0,
        team1_score: 0,
        team2_score: 0,
        team1: {
          id: 0,
          user_id: 0,
          name: "",
          tag: "",
          flag: "",
          logo: "",
          auth_name: {},
          public_team: false
        },
        team2: {
          id: 0,
          user_id: 0,
          name: "",
          tag: "",
          flag: "",
          logo: "",
          auth_name: {},
          public_team: false
        },
        symbol: "",
        cancelled: 0,
        forfeit: 0,
        id: -1,
        user_id: -1
      },
      serverInfo: {
        ip_string: "",
        port: 0,
        gotv_port: 0
      },
      apiUrl: process.env?.VUE_APP_G5V_API_URL || "/api",
      imageLoaded: true
    };
  },
  computed: {
    getStatusLabel() {
      if (this.matchInfo.cancelled) return this.$t("Matches.Cancelled");
      if (this.matchInfo.forfeit) return this.$t("MatchAdmin.ForfeitMatch");
      if (this.matchInfo.end_time) return this.$t("Matches.Finished");
      return "LIVE";
    },
    getStatusColor() {
      if (this.matchInfo.cancelled || this.matchInfo.forfeit) return "cyber-pink";
      if (this.matchInfo.end_time) return "grey lighten-1";
      return "primary";
    }
  },
  created() {
    this.checkIfMatchLive();
  },
  methods: {
    async checkIfMatchLive() {
      let matchRes = await this.GetMatchData(this.match_id);
      if (matchRes.end_time == null) await this.getStreamedMatchInfo();
      else await this.getMatchInfo();
    },
    async getStreamedMatchInfo() {
      try {
        let sseClient = await this.GetEventMatchData(this.match_id);
        await sseClient.connect();
        await sseClient.on("matches", async message => {
          try {
            await this.retrieveMatchInfoHelper(message);
          } catch (error) {
            console.error(
              "Error retrieving information from matches event stream. ",
              error
            );
          }
        });
        return;
      } catch (ignored) {
        return;
      }
    },
    async getMatchInfo() {
      try {
        let matchRes = await this.GetMatchData(this.match_id);
        await this.retrieveMatchInfoHelper(matchRes);
      } catch (error) {
        console.log(error);
      }
    },
    async retrieveMatchInfoHelper(serverResponse) {
      try {
        let team1Res = await this.GetBasicTeamInfo(serverResponse.team1_id);
        let team2Res = await this.GetBasicTeamInfo(serverResponse.team2_id);
        let serveRes = await this.GetServerData(serverResponse.server_id);
        this.matchInfo.team1_name = serverResponse.team1_string;
        this.matchInfo.team2_name = serverResponse.team2_string;
        this.matchInfo.team1_id = team1Res && team1Res.id ? team1Res.id : serverResponse.team1_id;
        this.matchInfo.team2_id = team2Res && team2Res.id ? team2Res.id : serverResponse.team2_id;
        this.matchInfo.start_time = new Date(
          serverResponse.start_time
        ).toLocaleString();
        this.matchInfo.end_time =
          serverResponse.end_time == null
            ? null
            : new Date(serverResponse.end_time).toLocaleString();
        this.matchInfo.team1_score = serverResponse.team1_score;
        this.matchInfo.team2_score = serverResponse.team2_score;
        this.matchInfo.symbol = this.GetScoreSymbol(
          this.matchInfo.team1_score,
          this.matchInfo.team2_score
        );
        this.matchInfo.team1 = team1Res;
        this.matchInfo.team2 = team2Res;
        this.matchInfo.cancelled = serverResponse.cancelled;
        this.matchInfo.forfeit = serverResponse.forfeit;
        this.matchInfo.id = this.match_id;
        this.matchInfo.user_id = serverResponse.user_id;
        if (serveRes) {
          this.serverInfo.ip_string = serveRes.ip_string;
          this.serverInfo.port = serveRes.port;
          this.serverInfo.gotv_port = serveRes.gotv_port;
        }
      } catch (err) {
        console.log(`Error on match helper. The error is ${err.toString()}`);
      }
    },
    imgUrlAlt(event) {
      if (event.target.src.includes("svg")) this.imageLoaded = false;
      else event.target.src = event.target.src.replace("png", "svg");
    }
  }
};
</script>

<style scoped>
.neon-halo {
  border: 3px solid var(--neon-cyan);
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.4);
  background: rgba(0, 0, 0, 0.3);
}

.team-name {
  font-size: 1.5rem;
  letter-spacing: 1px;
  color: white;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 10px 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.score-value {
  font-size: 3rem;
  font-weight: 800;
  font-family: "Orbitron", sans-serif;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.8);
}

.score-divider {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.3);
}

.status-chip {
  font-weight: 900;
  letter-spacing: 2px;
}

.pulse-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(0, 242, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0); }
}

.opacity-10 {
  opacity: 0.1;
}
</style>
