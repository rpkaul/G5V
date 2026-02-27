<template>
  <v-card class="glass-card mx-auto overflow-hidden" flat>
    <v-card-title class="pa-6 border-bottom align-center">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-3">mdi-creation</v-icon>
        <span class="font-orbitron primary--text headline m-0">{{ currentTitle }}</span>
      </div>
      <v-spacer />
      <v-avatar
        color="primary"
        class="black--text font-weight-black elevation-4"
        size="32"
        v-text="step"
      ></v-avatar>
    </v-card-title>

    <v-window v-model="step">
      <v-form ref="newMatchForm">
        <v-window-item :value="1">
          <div class="pa-8">
            <v-select
              v-model="selectedServer"
              :items="servers"
              item-text="display_name"
              item-value="id"
              :rules="[v => v != -1 || $t('misc.Required')]"
              :label="$t('CreateMatch.ServerLabel')"
              required
              ref="newServer"
              filled
              class="custom-field"
            >
              <template v-slot:item="{ item }">
                {{ item.display_name }} {{ item.flag }}
              </template>
            </v-select>
            <div class="glass-info pa-4 rounded-lg mt-4 mb-6">
              <v-icon x-small color="primary" class="mr-2">mdi-information-outline</v-icon>
              <span class="white--text opacity-70 caption">
                {{ $t("CreateMatch.ServerNote") }}
              </span>
            </div>
            <v-btn 
              depressed
              color="secondary" 
              class="px-6 rounded-lg font-weight-black"
              @click="newDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              {{ $t("misc.Create") }} {{ $t("CreateMatch.ServerSelect") }}
            </v-btn>
          </div>
        </v-window-item>

        <v-window-item :value="2">
          <div class="pa-8">
            <v-select
              v-model="selectedSeason"
              :items="seasons"
              item-text="name"
              item-value="id"
              :label="$t('CreateMatch.SeasonLabel')"
              ref="newServer"
              filled
              class="custom-field"
            />
            <div class="glass-info pa-4 rounded-lg mt-4">
              <v-icon x-small color="secondary" class="mr-2">mdi-trophy-outline</v-icon>
              <span class="white--text font-weight-bold caption">
                {{ $t("CreateMatch.SeasonNote") }}
              </span>
            </div>
          </div>
        </v-window-item>

        <v-window-item :value="3">
          <div class="pa-8">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newMatchData.team1_id"
                  :items="teams"
                  item-text="name"
                  item-value="id"
                  :rules="[
                    v => !!v || $t('CreateMatch.TeamRequired'),
                    () =>
                      newMatchData.team1_id != newMatchData.team2_id ||
                      $t('CreateMatch.TeamCannotBeEqual')
                  ]"
                  :label="$t('CreateMatch.FormTeam1')"
                  required
                  filled
                  class="custom-field"
                  ref="teamOne"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newMatchData.team2_id"
                  :items="teams"
                  item-text="name"
                  item-value="id"
                  :rules="[
                    v => !!v || $t('CreateMatch.TeamRequired'),
                    () =>
                      newMatchData.team2_id != newMatchData.team1_id ||
                      $t('CreateMatch.TeamCannotBeEqual')
                  ]"
                  :label="$t('CreateMatch.FormTeam2')"
                  required
                  filled
                  class="custom-field"
                  ref="teamTwo"
                />
              </v-col>
            </v-row>
            
            <div class="d-flex align-center justify-center my-4">
              <v-switch
                v-model="newMatchData.wingman"
                :label="$t('CreateMatch.Wingman')"
                ref="wingman"
                color="primary"
                inset
              />
            </div>

            <div class="text-center mb-10">
        <p class="white--text font-weight-black text-uppercase letter-spacing-1 mb-4">
          {{ $t("CreateMatch.FormSeriesType") }}
        </p>
        <v-radio-group
          v-model="newMatchData.maps_to_win"
          row
          ref="SeriesType"
          class="justify-center mt-0"
        >
          <v-radio :label="$t('CreateMatch.BestOf') + 1" :value="1" color="primary" class="mx-4" />
          <v-radio :label="$t('CreateMatch.BestOf') + 2" :value="2" color="primary" class="mx-4" />
          <v-radio :label="$t('CreateMatch.BestOf') + 3" :value="3" color="primary" class="mx-4" />
          <v-radio :label="$t('CreateMatch.BestOf') + 5" :value="5" color="primary" class="mx-4" />
          <v-radio :label="$t('CreateMatch.BestOf') + 7" :value="7" color="primary" class="mx-4" />
        </v-radio-group>
      </div>

            <div class="text-center mb-6">
              <h3 class="font-orbitron secondary--text subtitle-1 mb-4">
                {{ $t("CreateMatch.FormMapPool") }}
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on" size="18" class="ml-2">mdi-information-outline</v-icon>
                  </template>
                  <span>{{ $t("CreateMatch.FormMapExplanation") }}</span>
                </v-tooltip>
              </h3>
              <v-row no-gutters class="justify-center map-pool-row">
                <v-col class="map-col" v-for="maps in MapList" :key="maps.id">
                  <v-checkbox
                    v-model="newMatchData.map_pool"
                    :value="maps.map_name"
                    :label="maps.map_display_name"
                    dense
                    color="secondary"
                    class="mt-0"
                    :rules="[
                      () => newMatchData.map_pool.length > 0 || $t('CreateMatch.MapChoiceError'),
                      () => newMatchData.map_pool.length > newMatchData.maps_to_win - 1 || $t('CreateMatch.MapNotEnough')
                    ]"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="glass-panel pa-6 rounded-lg mb-6">
              <v-row>
                <v-col cols="12" md="4">
                  <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.PlayersPerTeam") }}</span>
                  <v-slider
                    v-model="newMatchData.players_per_team"
                    :min="1" :max="5"
                    thumb-label
                    ticks="always"
                    color="secondary"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.MinPlayersReady") }}</span>
                  <v-slider
                    v-model="newMatchData.min_players_to_ready"
                    :min="1" :max="5"
                    thumb-label
                    ticks="always"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.SpectatorsToReady") }}</span>
                  <v-slider
                    v-model="newMatchData.min_spectators_to_ready"
                    :min="0" :max="5"
                    thumb-label
                    ticks="always"
                  />
                </v-col>
              </v-row>
            </div>
            <v-combobox
              v-model="newMatchData.spectators"
              :label="$t('CreateMatch.Spectators')"
              multiple
              chips
              deletable-chips
              filled
              class="custom-field mb-4"
              :hint="$t('Team.AuthHint')"
            />

            <div class="d-flex align-center justify-center mb-6">
              <v-switch
                v-model="newMatchData.skip_veto"
                :label="$t('CreateMatch.SkipVeto')"
                color="secondary"
                inset
              />
            </div>

            <div v-if="newMatchData.skip_veto" class="text-center mb-6">
              <v-row class="justify-center map-preset-row">
                <div
                  v-for="(entity, index) in newMatchData.maps_to_win"
                  :key="index"
                  class="glass-panel rounded-lg pa-4 map-preset-col"
                >
                  <div class="map-preset-title mb-4">
                    {{ $t("CreateMatch.MapSides", { map: newMatchData.map_pool[index] || (index+1) }) }}
                  </div>
                  <v-radio-group v-model="newMatchData.map_sides[index]" class="mt-0">
                    <v-radio :label="team1Name + ' ' + $t('CreateMatch.MapSidesCT')" value="team1_ct" />
                    <v-radio :label="team2Name + ' ' + $t('CreateMatch.MapSidesCT')" value="team2_ct" />
                    <v-radio :label="$t('CreateMatch.MapSidesKnife')" value="knife" />
                  </v-radio-group>
                </div>
              </v-row>
            </div>

            <v-row class="justify-center">
              <v-radio-group v-model="newMatchData.side_type" row class="justify-center">
                <v-radio :label="$t('CreateMatch.KnifeDefault')" value="standard" color="primary" class="mx-2" />
                <v-radio :label="$t('CreateMatch.KnifeNever')" value="never_knife" color="primary" class="mx-2" />
                <v-radio :label="$t('CreateMatch.KnifeAlways')" value="always_knife" color="primary" class="mx-2" />
              </v-radio-group>
            </v-row>

            <v-combobox
              v-model="newMatchData.cvars"
              :label="$t('CreateMatch.FormCVARS')"
              ref="CVARs"
              :hint="$t('Seasons.CvarHint')"
              multiple
              chips
              filled
              class="custom-field mb-6"
              deletable-chips
            />

            <div class="d-flex justify-center mt-6">
              <v-btn
                color="primary"
                depressed
                class="black--text font-weight-black px-12 py-6 rounded-lg elevation-8 neon-btn"
                @click="callCreateMatch"
                :loading="isLoading"
              >
                <v-icon left>mdi-sword-cross</v-icon>
                {{ $t("Matches.CreateMatch") }}
              </v-btn>
            </div>
          </div>
        </v-window-item>
      </v-form>
    </v-window>

    <v-divider class="border-glow" />

    <v-card-actions class="pa-6">
      <v-btn 
        :disabled="step === 1" 
        text 
        @click="checkValidation(false)"
        class="grey--text font-weight-black"
      >
        <v-icon left>mdi-chevron-left</v-icon>
        {{ $t("misc.Back") }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="step !== 3"
        color="primary"
        class="black--text font-weight-black px-10"
        depressed
        @click="checkValidation"
      >
        {{ $t("misc.Next") }}
        <v-icon right>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-actions>

    <ServerDialog
      v-model="newDialog"
      :serverInfo="newServer"
      :title="$t('ServerCreate.NewServerTitle')"
      @is-new-server="ReloadServers"
    />

    <v-bottom-sheet v-model="responseSheet" inset persistent>
      <v-sheet class="text-center glass-card pa-8 border-top" height="200px">
        <div class="white--text title m-b6">
          {{ response }}
        </div>
        <v-btn 
          depressed
          color="primary" 
          class="black--text font-weight-black px-8 mt-4 rounded-lg"
          @click="GoToMatch"
        >
          {{ $t("misc.Close") }}
        </v-btn>
      </v-sheet>
    </v-bottom-sheet>
  </v-card>
</template>

<script>
import ServerDialog from "./ServerDialog";
export default {
  props: {
    user: Object
  },
  name: "CreateMatch",
  components: {
    ServerDialog
  },
  data: () => ({
    step: 1,
    servers: [],
    teams: [],
    seasons: [],
    selectedServer: -1,
    selectedSeasonObject: {},
    newServer: {},
    selectedSeason: -1,
    newMatchData: {
      min_players_to_ready: 5,
      min_spectators_to_ready: 0,
      players_per_team: 5,
      maps_to_win: 1,
      skip_veto: false,
      map_pool: [],
      cvars: [],
      veto_first: "team1",
      spectators: [],
      side_type: "standard",
      map_sides: [],
      wingman: false
    },
    selectedTeams: [],
    newDialog: false,
    response: "",
    responseSheet: false,
    newMatchId: null,
    isLoading: false,
    MapList: []
  }),
  computed: {
    currentTitle() {
      switch (this.step) {
        case 1:
          return this.$t("CreateMatch.FormServer");
        case 2:
          return this.$t("CreateMatch.FormSeason");
        case 3:
          return this.$t("CreateMatch.FormDetail");
        default:
          return this.$t("CreateMatch.FormError");
      }
    },
    team1Name() {
      if (this.newMatchData.team1_id) {
        const team = this.teams.find(t => t.id === this.newMatchData.team1_id);
        return team ? team.name : "Team 1";
      }
      return "Team 1";
    },
    team2Name() {
      if (this.newMatchData.team2_id) {
        const team = this.teams.find(t => t.id === this.newMatchData.team2_id);
        return team ? team.name : "Team 2";
      }
      return "Team 2";
    }
  },
  watch: {
    "newMatchData.team1_id"(val) {
      if (val) {
        const team = this.teams.find(t => t.id === val);
        if (team) this.newMatchData.team1_name = team.name;
      }
    },
    "newMatchData.team2_id"(val) {
      if (val) {
        const team = this.teams.find(t => t.id === val);
        if (team) this.newMatchData.team2_name = team.name;
      }
    },
    selectedSeason(val) {
      if (val === -1) {
        this.selectedSeasonObject = {};
        return;
      }
      let arrIndex = this.seasons
        .map(obj => {
          return obj.id;
        })
        .indexOf(val);
      this.selectedSeasonObject = this.seasons[arrIndex];
    },
    step(val) {
      if (val == 3) {
        if (this.selectedSeasonObject && this.selectedSeasonObject.cvars != null) {
          let seasonCvars = {...this.selectedSeasonObject.cvars};
          this.newMatchData.min_players_to_ready =
            seasonCvars.min_players_to_ready == null
              ? 5
              : parseInt(seasonCvars.min_players_to_ready);
          this.newMatchData.min_spectators_to_ready =
            seasonCvars.min_spectators_to_ready == null
              ? 0
              : parseInt(seasonCvars.min_spectators_to_ready);
          this.newMatchData.side_type =
            seasonCvars.side_type == null ? "standard" : seasonCvars.side_type;
          this.newMatchData.players_per_team =
            seasonCvars.players_per_team == null
              ? 5
              : parseInt(seasonCvars.players_per_team);
          this.newMatchData.maps_to_win =
            seasonCvars.maps_to_win == null
              ? 1
              : parseInt(seasonCvars.maps_to_win);
          this.newMatchData.skip_veto =
            seasonCvars.skip_veto == null || seasonCvars.skip_veto == 0
              ? false
              : true;
          this.newMatchData.map_pool =
            !seasonCvars.map_pool || seasonCvars.map_pool.length < 1
              ? []
              : seasonCvars.map_pool.trim().split(" ");
          this.newMatchData.spectators =
            !seasonCvars.spectators || seasonCvars.spectators.length < 1
              ? null
              : seasonCvars.spectators.trim().split(" ");
          this.newMatchData.map_sides =
            !seasonCvars.map_sides || seasonCvars.map_sides.length < 1
              ? []
              : seasonCvars.map_sides.trim().split(" ");
          this.newMatchData.wingman =
            seasonCvars.wingman == null || seasonCvars.wingman == 0
              ? false
              : true;
          //Delete all used get prepare custom CVARs.
          delete seasonCvars.min_players_to_ready;
          delete seasonCvars.min_spectators_to_ready;
          delete seasonCvars.players_per_team;
          delete seasonCvars.maps_to_win;
          delete seasonCvars.wingman;
          delete seasonCvars.skip_veto;
          delete seasonCvars.map_pool;
          delete seasonCvars.side_type;
          delete seasonCvars.spectators;
          delete seasonCvars.map_sides;
          // Now set Match CVARs. These will be converted back on submit.
          let tmpCvarArr = [];
          for (var obj in seasonCvars)
            tmpCvarArr.push(obj + " " + seasonCvars[obj]);
          this.newMatchData.cvars = tmpCvarArr;
        }
      }
    }
  },
  async created() {
    this.servers = await this.GetAllAvailableServers();
    if (typeof this.servers != "string") {
      this.servers.sort((a, b) => {
        return a.user_id - this.user.id || b.public_server - a.public_server;
      });
    }
    if (this.IsAnyAdmin(this.user)) this.teams = await this.GetAllTeams();
    else {
      let tmpPublicTeams = await this.GetAllTeams();
      this.teams = await this.GetMyTeams();
      if (typeof this.teams === "string") this.teams = [];
      tmpPublicTeams.forEach(async team => {
        if (team.public_team == 1) this.teams.push(team);
      });
    }
    this.teams.sort((a, b) => {
      return a.user_id - this.user.id || a.public_team - b.public_team;
    });
    this.seasons = await this.GetMyAvailableSeasons();
    if (typeof this.seasons == "string") this.seasons = [];
    this.MapList = await this.GetUserEnabledMapList(this.user.id);
    if (this.$route.query.season_id) {
      this.selectedSeason = parseInt(this.$route.query.season_id);
    }
  },
  methods: {
    async ReloadServers() {
      this.servers = await this.GetAllAvailableServers();
      let arrIndex = this.servers
        .map(obj => {
          return obj.ip_string + " " + obj.port + " " + obj.user_id;
        })
        .indexOf(
          this.newServer.ip_string +
            " " +
            this.newServer.port +
            " " +
            this.user.id
        );
      if (arrIndex !== -1) this.selectedServer = this.servers[arrIndex].id;
      this.newServer = {};
    },
    checkValidation(moveForward = true) {
      if (this.$refs.newMatchForm.validate()) {
        if (moveForward) this.step++;
        else this.step--;
      }
    },
    async callCreateMatch() {
      const form = this.$refs.newMatchForm;
      if (form.validate()) {
        this.isLoading = true;
        const splitStr = x => {
          const y = x.split(" ");
          let retVal;
          let key;
          let val;
          try {
            key = y[0].trim();
            y.splice(0, 1);
            val = y.join(" ").trim();
            if (!isNaN(val) && val !== "") val = parseInt(val);
            retVal = { [key]: val };
          } catch (error) {
            retVal = { [key]: "" };
          }
          return retVal;
        };
        let newCvar = Object.assign(
          {},
          ...this.newMatchData.cvars.map(splitStr)
        );
        let matchInsertObj = [
          {
            server_id: this.selectedServer,
            team1_id: this.newMatchData.team1_id,
            team2_id: this.newMatchData.team2_id,
            season_id: this.selectedSeason == -1 ? null : this.selectedSeason,
            start_time: new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " "),
            max_maps: this.newMatchData.maps_to_win,
            side_type: this.newMatchData.side_type,
            veto_mappool: this.newMatchData.map_pool.join(" "),
            match_cvars: newCvar,
            veto_first: this.newMatchData.veto_first,
            skip_veto: this.newMatchData.skip_veto,
            wingman: this.newMatchData.wingman,
            spectator_auths: this.newMatchData.spectators,
            min_players_to_ready: parseInt(
              this.newMatchData.min_players_to_ready
            ),
            players_per_team: parseInt(this.newMatchData.players_per_team),
            min_spectators_to_ready: parseInt(
              this.newMatchData.min_spectators_to_ready
            ),
            map_sides: this.newMatchData.map_sides.join(",")
          }
        ];
        try {
          let serverRes = await this.InsertMatch(matchInsertObj);
          if (serverRes.id != null)
            this.response = this.$t("CreateMatch.MessageRegisterSuccess");
          else this.response = serverRes.message;
          this.newMatchId = serverRes.id;
        } catch (error) {
          this.response = error.message;
          this.newMatchId = null;
        }
        this.responseSheet = true;
        this.isLoading = false;
        return;
      }
    },
    GoToMatch() {
      this.responseSheet = !this.responseSheet;
      this.response = "";
      if (this.newMatchId != null)
        this.$router.push({ name: `Match`, params: { id: this.newMatchId } });
    }
  }
};
</script>

<style scoped>
.glass-card {
  background: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
  backdrop-filter: blur(15px);
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-info {
  background: rgba(0, 242, 255, 0.05);
  border: 1px solid rgba(0, 242, 255, 0.1);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.custom-field ::v-deep .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px !important;
}

.neon-btn-active {
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.4) !important;
  &:hover {
    box-shadow: 0 0 30px rgba(0, 242, 255, 0.6) !important;
    transform: translateY(-2px);
  }
}

.opacity-70 { opacity: 0.7; }
.m-b6 { margin-bottom: 24px; }
.border-glow { border-color: rgba(0, 242, 255, 0.1) !important; }

.map-pool-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.map-col {
  flex: 0 0 calc(14.28% - 10px); /* 100% / 7 items */
  max-width: calc(14.28% - 10px);
  min-width: 120px; /* Prevent shrinking too small on mobile */
}

.map-preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 16px;
}
.map-preset-col {
  flex: 0 0 calc(33.333% - 16px);
  max-width: calc(33.333% - 16px);
  min-width: 250px;
}

.map-preset-title {
  font-family: 'Orbitron', sans-serif !important;
  color: #00f2ff !important; /* Force Cyan */
  font-size: 1.1rem !important; /* Increase from standard subtitle */
  text-transform: capitalize !important; /* Override uppercase if inherited */
  letter-spacing: 0.5px;
}
</style>
