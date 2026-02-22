<template>
  <v-container fluid class="pa-0">
    <v-data-table
      item-key="id"
      class="glass-table custom-table rounded-lg"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="headers"
      :items="seasons"
      :sort-by="['id']"
      sort-desc
      ref="SeasonsTable"
    >
      <template v-slot:top>
        <div class="d-flex align-center px-4 py-2 border-bottom">
          <v-spacer />
          <v-btn
            depressed
            color="primary"
            class="black--text font-weight-black neon-btn mr-2"
            rounded
            small
            @click="newDialog = true"
            v-if="user.id != null && user.id != -1"
          >
            <v-icon left size="18">mdi-plus</v-icon>
            {{ $t("Seasons.New") }}
          </v-btn>
          <v-btn
            depressed
            color="secondary"
            class="white--text font-weight-black rounded-lg neon-btn"
            rounded
            small
            @click="newImportDialog = true"
            v-if="user.id != null && user.id != -1"
          >
            <v-icon left size="18">mdi-cloud-import</v-icon>
            {{ $t("Seasons.ImportSeason") }}
          </v-btn>
        </div>
      </template>
      <template v-slot:item.id="{ item }">
        <router-link :to="{ path: '/season/' + item.id }" class="primary--text font-weight-black">
          #{{ item.id }}
        </router-link>
      </template>
      <template v-slot:item.name="{ item }">
        <router-link :to="{ path: '/season/' + item.id }" class="white--text font-weight-bold hover-link">
          {{ item.name }}
        </router-link>
      </template>
      <template v-slot:item.owner="{ item }">
        <router-link :to="{ path: '/user/' + item.user_id }" class="secondary--text font-weight-bold">
          {{ item.owner }}
        </router-link>
      </template>
      <template v-slot:item.end_date="{ item }">
        <div v-if="item.end_date == null" class="grey--text lighten-1">
          {{ $t("Seasons.NotFinished") }}
        </div>
        <div v-else class="white--text">
          {{ item.end_date }}
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-btn
            depressed
            color="primary"
            class="black--text font-weight-black rounded-lg neon-btn-small mr-2"
            :to="{ path: '/season/' + item.id }"
            x-small
          >
            {{ $t("misc.View") }}
          </v-btn>
          <div
            v-if="
              user.super_admin == 1 || user.admin == 1 || item.user_id == user.id
            "
            class="d-flex"
          >
            <v-btn icon small @click="editSelectedSeason(item)" class="mr-1">
              <v-icon color="primary" small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="deleteSelectedSeason(item)">
              <v-icon color="cyber-pink" small>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-data-table>
    <v-bottom-sheet v-model="responseSheet" inset persistent>
      <v-sheet class="text-center glass-card pa-8 border-top" height="200px">
        <div class="white--text title mb-6">
          {{ response }}
        </div>
        <v-btn
          depressed
          color="primary"
          class="black--text font-weight-black px-8 rounded-lg"
          @click="
            responseSheet = !responseSheet;
            response = '';
          "
        >
          {{ $t("misc.Close") }}
        </v-btn>
      </v-sheet>
    </v-bottom-sheet>
    <v-dialog v-model="deleteDialog" persistent max-width="600px">
      <v-card class="glass-card pa-4">
        <v-card-title>
          <span class="font-orbitron cyber-pink--text headline title-glow">
            {{ $t("Seasons.DeleteConfirmation") }}
          </span>
        </v-card-title>
        <v-card-text class="white--text opacity-80 mt-2">
          {{ $t("Seasons.DeleteExplain") }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="deleteDialog = false" class="font-weight-black">
            {{ $t("misc.No") }}
          </v-btn>
          <v-btn color="cyber-pink" depressed class="black--text font-weight-black px-6 rounded-lg" @click="deleteSeasonConfirm()">
            {{ $t("misc.Yes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="newImportDialog"
      transition="dialog-bottom-transition"
      max-width="600px"
    >
      <v-card class="glass-card pa-4">
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ $t("Seasons.Import") }}
          </span>
        </v-card-title>
        <v-card-text v-html="$t('Seasons.ImportExplanation')" class="white--text opacity-80 mt-2" />
        <v-card-text>
          <v-form ref="newImportForm">
            <v-container>
              <v-row>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-model="challongeInfo.tournament_id"
                    ref="ChallongeUrl"
                    :label="$t('Seasons.ImportUrl')"
                    filled
                    class="custom-field"
                    required
                  />
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <v-switch
                    v-model="challongeInfo.import_teams"
                    :label="$t('Seasons.ImportTeams')"
                    color="primary"
                    inset
                    ref="skipveto"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="newImportDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-6 rounded-lg" @click="importChallongeSeason()">
            {{ $t("misc.Import") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      shake
      v-model="newDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card class="glass-card pa-0 overflow-hidden" style="border-radius: 0 !important;">
        <v-toolbar flat color="transparent" class="border-bottom">
          <v-btn icon @click="newDialog = false">
            <v-icon color="grey lighten-1">mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="font-orbitron primary--text headline title-glow">
            {{ formTitle }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed class="black--text font-weight-black px-10 rounded-lg elevation-4 neon-btn" @click="saveNewSeason()">
            <v-icon left>mdi-content-save</v-icon>
            {{ $t("misc.Save") }}
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-10">
          <v-form ref="newSeasonForm">
            <v-container>
              <!-- Info Section -->
              <div class="glass-panel pa-6 rounded-lg mb-8">
                <h3 class="font-orbitron secondary--text subtitle-1 mb-6 d-flex align-center">
                  <v-icon color="secondary" class="mr-3">mdi-information</v-icon>
                  General Information
                </h3>
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="newSeason.name"
                      ref="SeasonName"
                      :label="$t('Seasons.Name')"
                      filled
                      class="custom-field"
                      required
                      :rules="[
                        () => !!newSeason.name || 'This field is required'
                      ]"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-menu
                      v-model="datemenu"
                      :close-on-content-click="false"
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="dateRangeText"
                          v-on="on"
                          readonly
                          filled
                          class="custom-field"
                          prepend-inner-icon="mdi-calendar"
                          :label="$t('Seasons.DateTitle')"
                          :rules="[
                            v => !!v || $t('misc.Required'),
                            rules.dateLessThan
                          ]"
                        />
                      </template>
                      <v-date-picker
                        v-model="newSeason.dates"
                        :label="$t('Seasons.DateTitle')"
                        ref="DateRange"
                        range
                        color="primary"
                        header-color="primary"
                        dark
                      />
                    </v-menu>
                  </v-col>
                </v-row>
              </div>

              <!-- Logic Section -->
              <div class="glass-panel pa-6 rounded-lg mb-8">
                <h3 class="font-orbitron secondary--text subtitle-1 mb-6 d-flex align-center">
                  <v-icon color="secondary" class="mr-3">mdi-cog</v-icon>
                  Match Configuration
                </h3>
                
                <v-row class="justify-center mb-6">
                  <v-col cols="12" md="2" class="d-flex justify-center">
                    <v-switch
                      v-model="seasonDefaults.wingman"
                      :label="$t('CreateMatch.Wingman')"
                      color="primary"
                      inset
                      ref="wingman"
                    />
                  </v-col>
                </v-row>

                <div class="text-center mb-10">
                  <p class="white--text font-weight-black text-uppercase letter-spacing-1 mb-4">
                    {{ $t("CreateMatch.FormSeriesType") }}
                  </p>
                  <v-radio-group
                    v-model="seasonDefaults.maps_to_win"
                    row
                    class="justify-center mt-0"
                  >
                    <v-radio :label="$t('CreateMatch.BestOf') + 1" :value="1" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.BestOf') + 2" :value="2" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.BestOf') + 3" :value="3" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.BestOf') + 5" :value="5" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.BestOf') + 7" :value="7" color="primary" class="mx-4" />
                  </v-radio-group>
                </div>

                <div class="glass-info pa-6 rounded-lg mb-8">
                  <v-row>
                    <v-col cols="12" md="4">
                      <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.PlayersPerTeam") }}</span>
                      <v-slider
                        v-model="seasonDefaults.players_per_team"
                        :min="1" :max="5"
                        thumb-label
                        ticks="always"
                        color="secondary"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.MinPlayersReady") }}</span>
                      <v-slider
                        v-model="seasonDefaults.min_players_to_ready"
                        :min="1" :max="5"
                        thumb-label
                        ticks="always"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <span class="caption secondary--text text-uppercase font-weight-black mb-2 d-block">{{ $t("CreateMatch.SpectatorsToReady") }}</span>
                      <v-slider
                        v-model="seasonDefaults.min_spectators_to_ready"
                        :min="0" :max="5"
                        thumb-label
                        ticks="always"
                      />
                    </v-col>
                  </v-row>
                </div>

                <div class="text-center mb-8">
                  <h3 class="font-orbitron primary--text subtitle-1 mb-4">
                    {{ $t("CreateMatch.FormMapPool") }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" x-small fab icon class="ml-2">
                          <v-icon size="18">mdi-information</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t("CreateMatch.FormMapExplanation") }}</span>
                    </v-tooltip>
                  </h3>
                  <v-row no-gutters class="justify-center">
                    <v-col cols="6" sm="4" md="2" v-for="maps in MapList" :key="maps.id">
                      <v-checkbox
                        v-model="seasonDefaults.map_pool"
                        :value="maps.map_name"
                        :label="maps.map_display_name"
                        dense
                        color="primary"
                        :rules="[
                          () =>
                            seasonDefaults.map_pool.length > 0 ||
                            $t('CreateMatch.MapChoiceError'),
                          () =>
                            seasonDefaults.map_pool.length >
                              seasonDefaults.maps_to_win - 1 ||
                            $t('CreateMatch.MapNotEnough')
                        ]"
                      />
                    </v-col>
                  </v-row>
                </div>

                <v-combobox
                  v-model="seasonDefaults.spectators"
                  :label="$t('CreateMatch.Spectators')"
                  ref="matchspecs"
                  :hint="$t('Team.AuthHint')"
                  multiple
                  chips
                  filled
                  class="custom-field mb-6"
                  deletable-chips
                />

                <v-row class="justify-center align-center mb-6">
                  <v-switch
                    v-model="seasonDefaults.skip_veto"
                    :label="$t('CreateMatch.SkipVeto')"
                    color="secondary"
                    inset
                    ref="skipveto"
                  />
                </v-row>

                <div class="text-center mb-8">
                  <v-radio-group
                    v-model="seasonDefaults.side_type"
                    row
                    class="justify-center mt-0"
                  >
                    <v-radio :label="$t('CreateMatch.KnifeDefault')" value="standard" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.KnifeNever')" value="never_knife" color="primary" class="mx-4" />
                    <v-radio :label="$t('CreateMatch.KnifeAlways')" value="always_knife" color="primary" class="mx-4" />
                  </v-radio-group>
                </div>

                <v-row class="justify-center" v-if="seasonDefaults.skip_veto">
                  <v-col
                    cols="12" sm="6" md="4"
                    v-for="(entity, index) in seasonDefaults.maps_to_win"
                    :key="index"
                    class="glass-panel ma-2 rounded-lg pa-4 border-glow"
                  >
                    <div class="font-orbitron primary--text subtitle-2 mb-3">
                      {{
                        $t("CreateMatch.MapSides", {
                          map:
                            seasonDefaults.map_pool[index] == null
                              ? (index + 1)
                              : seasonDefaults.map_pool[index]
                        })
                      }}
                    </div>
                    <v-radio-group
                      v-model="seasonDefaults.map_sides[index]"
                      class="mt-0"
                    >
                      <v-radio :label="$t('CreateMatch.MapSidesTeam1CT')" value="team1_ct" color="primary" dense />
                      <v-radio :label="$t('CreateMatch.MapSidesTeam2CT')" value="team1_t" color="primary" dense />
                      <v-radio :label="$t('CreateMatch.MapSidesKnife')" value="knife" color="primary" dense />
                    </v-radio-group>
                  </v-col>
                </v-row>

                <v-combobox
                  v-model="newSeason.cvars"
                  :label="$t('CreateMatch.FormCVARS')"
                  ref="CVARs"
                  :hint="$t('Seasons.CvarHint')"
                  multiple
                  chips
                  filled
                  class="custom-field"
                  deletable-chips
                />
              </div>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      seasons: [],
      isLoading: true,
      deleteDialog: false,
      response: "",
      responseSheet: false,
      removeIndex: -1,
      removeSeason: {},
      newDialog: false,
      newImportDialog: false,
      newSeason: {
        name: "",
        dates: [],
        cvars: []
      },
      seasonDefaults: {
        min_players_to_ready: 5,
        min_spectators_to_ready: 0,
        players_per_team: 5,
        maps_to_win: 1,
        skip_veto: false,
        map_pool: [],
        spectators: [],
        side_type: "standard",
        map_sides: [],
        wingman: false
      },
      datemenu: false,
      formTitle: this.$t("Seasons.NewFormTitle"),
      MapList: [],
      rules: {
        dateLessThan: v => {
          let tmpDateArr = v.split(" ~ ");
          if (tmpDateArr[1] == undefined) {
            return true;
          } else
            return tmpDateArr[0] <= tmpDateArr[1] || this.$t("misc.LessThan");
        }
      },
      challongeInfo: {
        tournament_id: "",
        import_teams: true
      }
    };
  },
  mounted() {
    this.GetSeasons();
  },
  watch: {
    newDialog(val) {
      if (!val) {
        this.formTitle = this.$t("Seasons.NewFormTitle");
        this.$nextTick(() => {
          this.newSeason = {
            name: "",
            dates: [
              new Date()
                .toISOString()
                .substr(0, 10)
                .slice(0, 19)
                .replace("T", " ")
            ],
            cvars: []
          };
          this.seasonDefaults = {
            min_players_to_ready: 5,
            min_spectators_to_ready: 0,
            players_per_team: 5,
            maps_to_win: 1,
            skip_veto: false,
            map_pool: [],
            spectators: [],
            side_type: "standard",
            map_sides: [],
            wingman: false
          };
          this.$refs.newSeasonForm.resetValidation();
        });
      }
    },
    newImportDialog(val) {
      if (!val) {
        this.$refs.newImportForm.resetValidation();
      }
    }
  },
  methods: {
    async GetSeasons() {
      try {
        let res;
        if (this.$route.path == "/myseasons") res = await this.GetMySeasons();
        else res = await this.GetAllSeasons();
        if (typeof res == "string") res = [];
        this.MapList = await this.GetUserEnabledMapList(this.user.id);
        res.forEach(async season => {
          const ownerRes = await this.GetUserData(season.user_id);
          season.owner = ownerRes.name;
          season.start_date = new Date(season.start_date).toLocaleDateString(
            "en-CA"
          );
          if (season.end_date != null)
            season.end_date = new Date(season.end_date).toLocaleDateString(
              "en-CA"
            );
          this.seasons.push(season);
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    deleteSelectedSeason(item) {
      if (item != null) {
        this.removeIndex = this.seasons.indexOf(item);
        this.removeSeason = Object.assign({}, item);
      }
      this.deleteDialog = true;
    },
    async deleteSeasonConfirm() {
      let memberData = [
        {
          season_id: this.removeSeason.id
        }
      ];
      let tmpResp = await this.DeleteSeason(memberData);
      if (tmpResp.includes("successfully!"))
        this.response = this.$t("Seasons.SeasonDeleted");
      else this.response = tmpResp;
      this.seasons.splice(this.removeIndex, 1);
      this.closeDelete();
    },
    closeDelete() {
      this.deleteDialog = false;
      this.responseSheet = true;
      this.$nextTick(() => {
        this.removeSeason = {};
        this.removeIndex = -1;
      });
    },
    async saveNewSeason() {
      if (this.$refs.newSeasonForm.validate()) {
        let serverRes;
        let newCvar;
        const splitStr = x => {
          const y = x.split(" ");
          let retVal;
          let key;
          let val;
          try {
            key = y[0].trim();
            y.splice(0, 1);
            val = y.join(" ").trim();
            retVal = { [key]: val };
          } catch (error) {
            retVal = { [key]: "" };
          }
          return retVal;
        };
        if (this.newSeason.cvars) {
          newCvar = Object.assign(
            {},
            ...this.newSeason.cvars.map(splitStr),
            this.seasonDefaults
          );
        }
        if (newCvar) {
          newCvar.spectators =
            newCvar.spectators != "" ? newCvar.spectators.join(" ") : "";
          newCvar.map_pool = newCvar.map_pool.join(" ");
          newCvar.map_sides =
            newCvar.map_sides != "" ? newCvar.map_sides.join(" ") : "";
        }
        if (this.newSeason.id == null) {
          let serverObj = [
            {
              name: this.newSeason.name,
              start_date: this.newSeason.dates[0],
              end_date:
                this.newSeason.dates[1] == undefined
                  ? null
                  : this.newSeason.dates[1],
              season_cvar: newCvar
            }
          ];
          serverRes = await this.InsertSeason(serverObj);
        } else {
          let updateObj = [
            {
              season_id: this.newSeason.id,
              name: this.newSeason.name,
              start_date: this.newSeason.dates[0],
              end_date:
                this.newSeason.dates[1] == undefined
                  ? null
                  : this.newSeason.dates[1],
              season_cvar: newCvar
            }
          ];
          serverRes = await this.UpdateSeasonInfo(updateObj);
        }
        if (serverRes.id != null)
          this.response = this.$t("Seasons.SeasonCreated");
        else if (this.newSeason.id != null)
          this.response = this.$t("Seasons.SeasonUpdated");
        this.responseSheet = true;
        this.newDialog = false;
        this.seasons = [];
        this.GetSeasons();
        this.formTitle = this.$t("Seasons.NewFormTitle");
        this.$nextTick(() => {
          this.newSeason = {
            name: "",
            dates: [
              new Date()
                .toISOString()
                .substr(0, 10)
                .slice(0, 19)
                .replace("T", " ")
            ],
            cvars: []
          };
          this.seasonDefaults = {
            min_players_to_ready: 5,
            min_spectators_to_ready: 0,
            players_per_team: 5,
            maps_to_win: 1,
            skip_veto: false,
            map_pool: [],
            spectators: [],
            side_type: "standard",
            map_sides: [],
            wingman: false
          };
          this.$refs.newSeasonForm.resetValidation();
        });
        return;
      }
    },
    async editSelectedSeason(item) {
      this.formTitle = this.$t("Seasons.EditFormTitle");
      let dateArray = [];
      dateArray.push(new Date(item.start_date).toISOString().substr(0, 10));
      if (item.end_date != null)
        dateArray.push(new Date(item.end_date).toISOString().substr(0, 10));
      let seasonCvars = await this.GetSeasonCVARs(item.id);
      let tmpArr = [];
      // If our cvars are empty, make an empty object instead to allow future saving.
      if (typeof seasonCvars == "string") seasonCvars = {};
      else {
        for (let obj in seasonCvars) {
          if (
            obj !== "min_players_to_ready" &&
            obj !== "min_spectators_to_ready" &&
            obj !== "min_spectators_to_ready" &&
            obj !== "players_per_team" &&
            obj !== "maps_to_win" &&
            obj !== "skip_veto" &&
            obj !== "wingman" &&
            obj !== "map_pool" &&
            obj !== "spectators" &&
            obj !== "side_type" &&
            obj !== "map_sides"
          )
            tmpArr.push(obj + " " + seasonCvars[obj]);
          else if (
            obj === "map_pool" ||
            (obj === "spectators" && seasonCvars[obj] !== "")
          )
            this.seasonDefaults[obj] = seasonCvars[obj].split(" ");
          else if (obj === "maps_to_win")
            this.seasonDefaults[obj] = parseInt(seasonCvars[obj]);
          else if (obj === "skip_veto" || obj === "wingman") {
            seasonCvars[obj] = seasonCvars[obj] == 0 ? false : true;
            this.seasonDefaults[obj] = seasonCvars[obj];
          } else if (obj === "map_sides") {
            this.seasonDefaults[obj] = seasonCvars[obj].split(" ");
          } else this.seasonDefaults[obj] = seasonCvars[obj];
        }
      }
      this.newSeason = {
        id: item.id,
        dates: dateArray,
        cvars: seasonCvars == null ? seasonCvars : tmpArr,
        name: item.name
      };
      this.newDialog = true;
    },
    async importChallongeSeason() {
      let importData = [this.challongeInfo];
      let isImport = await this.ImportSeason(importData);
      if (isImport.id) {
        this.seasons = [];
        this.GetSeasons();
        this.newImportDialog = false;
      } else {
        this.response = this.$t("Seasons.ImportError");
        this.responseSheet = true;
        this.$nextTick(() => {
          this.challongeInfo = {
            tournament_id: "",
            import_teams: true
          };
        });
      }
      return;
    }
  },
  computed: {
    dateRangeText() {
      return this.newSeason.dates.join(" ~ ");
    },
    headers() {
      return [
        {
          text: this.$t("Seasons.ID"),
          align: "start",
          sortable: true,
          value: "id"
        },
        {
          text: this.$t("Seasons.Name"),
          value: "name"
        },
        {
          text: this.$t("Seasons.StartTitle"),
          value: "start_date"
        },
        {
          text: this.$t("Seasons.EndTitle"),
          value: "end_date"
        },
        {
          text: this.$t("Matches.Owner"),
          value: "owner"
        },
        {
          text: "",
          value: "actions",
          sortable: false,
          align: "end"
        }
      ];
    }
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.neon-btn {
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

.neon-btn:hover {
  box-shadow: 0 0 25px rgba(0, 242, 255, 0.5);
  transform: translateY(-2px);
}

.opacity-80 {
  opacity: 0.8;
}

.custom-field ::v-deep .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px !important;
}
</style>
