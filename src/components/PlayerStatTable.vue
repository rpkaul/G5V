<template>
  <v-container class="statistics pa-0" fluid>
    <div v-if="playerstats.length > 0">
      <v-container
        v-for="(playerMapStats, index) in playerstats"
        :key="playerMapStats[0].id"
        class="mb-8 pa-0"
      >
        <v-card class="glass-card pa-6 overflow-hidden custom-map-card">
          <!-- Top Centered Match Info block -->
          <div class="text-center mb-6">
            <h2 class="font-orbitron white--text mb-2 text-h5" v-if="mapStats[index] != null">
              <span class="primary--text">Score:</span> {{ mapStats[index].score }} <span class="mx-2">-</span> <span class="primary--text">Map:</span> {{ mapStats[index].map }}
            </h2>
            <div class="grey--text font-weight-bold caption" v-if="mapStats[index] != null">
              <div v-if="mapStats[index].start != null">Map Start: {{ mapStats[index].start }}</div>
              <div v-if="mapStats[index].end != null">Map End: {{ mapStats[index].end }}</div>
            </div>
          </div>
          <div class="text-center mb-4" v-if="mapStats[index] != null && mapStats[index].demo != null">
            <v-btn
              small
              color="white"
              outlined
              class="font-weight-bold"
              rounded
              :href="apiUrl + '/demo/' + mapStats[index].demo"
            >
              <v-icon left small>mdi-download</v-icon>
              {{ $t("PlayerStats.Download") }}
            </v-btn>
          </div>

          <!-- The Glass Table for the Map -->
          <v-data-table
            item-key="id"
            class="custom-table"
            :items-per-page="12"
            :loading="isLoading"
            :loading-text="$t('misc.LoadText')"
            :headers="headers"
            :items="playerMapStats"
            sort-by="kills"
            sort-desc
            ref="PlayerStats"
            group-by="Team"
            show-group-by
            hide-default-footer
            show-expand
          >
            <!-- Group Header (Team Name styling) -->
            <template v-slot:group.header="{ items, isOpen, toggle }">
              <th :colspan="headers.length" style="background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.1); text-align: center;" @click="toggle">
                <span class="secondary--text font-weight-bold font-orbitron subtitle-1 text-uppercase letter-spacing-1">
                  Team: {{ items[0].Team.slice(2) }}
                </span>
              </th>
            </template>
            
            <template v-slot:item.name="{ item }">
              <router-link :to="{ path: '/user/' + item.steam_id }" class="text-decoration-none font-weight-bold">
                <span :class="item.Team.slice(0, 1) === '1' ? 'secondary--text' : 'primary--text'">{{ item.name }}</span>
              </router-link>
            </template>
            <template v-slot:item.Team="{ item }">
              <span class="white--text font-weight-bold">{{ item.Team.slice(2) }}</span>
            </template>
            <template v-slot:expanded-item="{ item }">
              <td :colspan="headers.length" class="pa-0">
                <v-data-table
                  item-key="id"
                  class="custom-table"
                  style="background: rgba(0,0,0,0.4);"
                  :headers="additionalHeaders"
                  hide-default-footer
                  dense
                  :items="[item]"
                  disable-sort
                />
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </div>
    <div v-else align="center" class="pa-8">
      <v-icon x-large color="grey darken-2" class="mb-4">mdi-flask-empty-outline</v-icon>
      <h3 class="grey--text text--darken-1">{{ $t("PlayerStats.NoStatFound") }}</h3>
    </div>
  </v-container>
</template>

<script>
export default {
  props: {
    match_id: Number
  },
  data() {
    return {
      playerstats: [],
      isLoading: true,
      mapStats: [],
      allowRefresh: false,
      timeoutId: -1,
      isFinished: false,
      apiUrl: process.env?.VUE_APP_G5V_API_URL || "/api"
    };
  },
  created() {
    this.useStreamOrStaticData();
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("PlayerStats.User"),
          align: "start",
          sortable: true,
          value: "name",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.Kills"),
          value: "kills",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.Deaths"),
          value: "deaths",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.ADR"),
          value: "adr",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.KDR"),
          value: "kdr",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.FPR"),
          value: "fpr",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.Headshot") + "%",
          value: "hsp",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.UtilDamage"),
          value: "util_damage",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.MVP"),
          value: "mvp",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.Rating"),
          value: "rating",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.TeamName"),
          value: "Team",
          align: "right"
        },
        {
          text: "",
          value: "data-table-expand",
          groupable: false,
          align: "end"
        }
      ];
    },
    additionalHeaders() {
      return [
        {
          text: this.$t("PlayerStats.Assists"),
          value: "assists"
        },
        {
          text: this.$t("PlayerStats.FlashbangAssists"),
          value: "flashbang_assists"
        },
        {
          text: this.$t("PlayerStats.EnemyFlash"),
          value: "enemies_flashed"
        },
        {
          text: this.$t("PlayerStats.FriendFlash"),
          value: "friendlies_flashed"
        },
        {
          text: this.$t("PlayerStats.Suicides"),
          value: "suicides"
        },
        {
          text: this.$t("PlayerStats.KnifeKills"),
          value: "knife_kills"
        },
        {
          text: this.$t("PlayerStats.BombPlants"),
          value: "bomb_plants"
        },
        {
          text: this.$t("PlayerStats.BombDefuses"),
          value: "bomb_defuses"
        },
        {
          text: this.$t("PlayerStats.KAST"),
          value: "kast"
        },
        {
          text: this.$t("PlayerStats.ContribScore"),
          value: "contribution_score"
        }
      ];
    }
  },
  methods: {
    async useStreamOrStaticData() {
      // Template will contain v-rows/etc like on main Team page.
      let matchData = await this.GetMatchData(this.match_id);
      if (matchData.end_time == null) {
           this.GetMapStatsStream(matchData);
           this.GetMapPlayerStatsStream(matchData);
      }
      else {
           this.getMapString(matchData);
           this.GetMapPlayerStats(matchData);
      }
    },
    async retrieveStatsHelper(serverResponse, matchData) {
      if (typeof serverResponse == "string") return;
      let allMapIds = [];
      let totalMatchTeam = [];
      serverResponse.filter(item => {
        let i = allMapIds.findIndex(x => x == item.map_id);
        if (i <= -1) allMapIds.push(item.map_id);
        return null;
      });
      allMapIds.forEach(map_id => {
        totalMatchTeam.push(
          serverResponse.filter(stats => {
            return stats.map_id == map_id;
          })
        );
      });
      this.playerstats = totalMatchTeam;
      await this.playerstats.forEach((matchStats, idx) => {
        matchStats.forEach(async (player, pIdx) => {
          if (player.roundsplayed > 0) {
            let getRating = this.GetRating(
              player.kills,
              player.roundsplayed,
              player.deaths,
              player.k1,
              player.k2,
              player.k3,
              player.k4,
              player.k5
            );
            let adr = this.GetADR(player);
            let hsp = this.GetHSP(player);
            let kdr = this.GetKDR(player);
            let fpr = this.GetFPR(player);
            let teamNum;
            let newName;
            if (player.team_id) {
              teamNum = player.team_id == matchData.team1_id ? 1 : 2;
              newName =
                player.team_id == matchData.team1_id
                  ? matchData.team1_string
                  : matchData.team2_string;
            } else {
              // If we don't have a team ID, we must be pugging. Go based on
              // Team strings alone.
              teamNum = player.team_name == matchData.team1_string ? 1 : 2;
              newName = 
                player.team_name == matchData.team1_string
                  ? matchData.team1_string
                  : matchData.team2_string;
            }
            this.$set(
              this.playerstats[idx][pIdx],
              "Team",
              teamNum + " " + newName
            );
            this.$set(this.playerstats[idx][pIdx], "rating", getRating);
            this.$set(this.playerstats[idx][pIdx], "adr", adr);
            this.$set(this.playerstats[idx][pIdx], "hsp", hsp);
            this.$set(this.playerstats[idx][pIdx], "kdr", kdr);
            this.$set(this.playerstats[idx][pIdx], "fpr", fpr);
          }
        });
      });
      if (matchData.end_time != null) this.isFinished = true;
    },
    async GetMapPlayerStatsStream(matchData) {
      try {
        let sseClient = await this.GetEventPlayerStats(this.match_id);
        await sseClient.connect();
        await sseClient.on("playerstats", async message => {
          await this.retrieveStatsHelper(message, matchData);
        });
      } catch (error) {
        console.log("Our error: " + error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    async GetMapPlayerStats(matchData) {
      try {
        let res = await this.GetPlayerStats(this.match_id);
        await this.retrieveStatsHelper(res, matchData);
      } catch (error) {
        console.log("Our error: " + error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    async GetMapStatsStream(matchData) {
      try {
        let sseClient = await this.GetEventMapStats(this.match_id);
        await sseClient.connect();
        await sseClient.on("mapstats", async message => {
          await this.retrieveMapStatsHelper(message,matchData);
        });
      } catch (error) {
        console.log("Our error: " + error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    async getMapString(matchData) {
      try {
        let res = await this.GetMapStats(this.match_id);
        await this.retrieveMapStatsHelper(res, matchData);
      } catch (error) {
        console.log("Our error: " + error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    async retrieveMapStatsHelper(serverResponse, matchData) {
      if (typeof serverResponse == "string") return;
      await serverResponse.forEach((singleMapStat, index) => {
        if (!this.mapStats[index]) {
          this.$set(this.mapStats, index, {});
        }

        this.$set(this.mapStats[index], 'score',
          singleMapStat.team1_score +
          " " +
          this.GetScoreSymbol(
            singleMapStat.team1_score,
            singleMapStat.team2_score
          ) +
          " " +
          singleMapStat.team2_score);
        this.$set(this.mapStats[index], 'start', new Date(singleMapStat.start_time).toLocaleString());
        this.$set(this.mapStats[index], 'end', singleMapStat.end_time == null ?
          null :
          new Date(singleMapStat.end_time).toLocaleString());
        this.$set(this.mapStats[index], 'map', singleMapStat.map_name);
        this.$set(this.mapStats[index], 'demo', singleMapStat.demoFile);
      });
      if (matchData.end_time != null) this.isFinished = true;
    }
  }
};
</script>

<style scoped>
/* Ensure data-table is completely transparent inside the card */
.custom-map-card .custom-table {
  background: transparent !important;
  box-shadow: none !important;
}

.custom-map-card .custom-table .v-data-table-header th {
  background: rgba(0, 0, 0, 0.1) !important;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  font-weight: bold;
}

.custom-map-card .custom-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.custom-map-card .custom-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
