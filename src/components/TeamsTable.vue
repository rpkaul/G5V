<template>
  <v-container fluid class="pa-0">
    <v-data-table
      item-key="id"
      class="glass-table custom-table"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="headers"
      :items="teams"
      :options.sync="options"
      :server-items-length="totalTeams"
      ref="TeamsTable"
    >
      <template v-slot:top>
        <div class="d-flex align-center px-4 py-2 border-bottom">
          <v-spacer />
          <v-btn
            depressed
            color="primary"
            class="black--text font-weight-black rounded-lg mr-2 neon-btn"
            to="/teams/create"
            v-if="user.id != null && user.id != -1"
            small
          >
            <v-icon left size="18">mdi-plus</v-icon>
            {{ $t("Navbar.CreateTeam") }}
          </v-btn>
          <v-btn
            depressed
            color="secondary"
            class="font-weight-black rounded-lg"
            @click="newImportDialog = true"
            v-if="user.id != null && user.id != -1"
            small
          >
            <v-icon left size="18">mdi-cloud-import</v-icon>
            {{ $t("Seasons.ImportSeason") }}
          </v-btn>
        </div>
      </template>
      <template v-slot:item.id="{ item }">
        <router-link :to="{ path: '/teams/' + item.id }" class="primary--text font-weight-black">
          #{{ item.id }}
        </router-link>
      </template>
      <template v-slot:item.name="{ item }">
        <router-link :to="{ path: '/teams/' + item.id }" class="white--text font-weight-bold hover-link">
          {{ item.name }}
        </router-link>
      </template>
      <template v-slot:item.owner="{ item }">
        <router-link :to="{ path: '/user/' + item.user_id }" class="secondary--text font-weight-bold">
          {{ item.owner }}
        </router-link>
      </template>
      <template v-slot:item.flag="{ item }">
        <v-img :src="get_flag_link(item)" max-width="24" class="rounded-sm elevation-2" />
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          depressed
          color="primary"
          class="black--text font-weight-black rounded-lg neon-btn-small"
          :to="{ path: '/teams/' + item.id }"
          x-small
        >
          {{ $t("misc.View") }}
        </v-btn>
      </template>
    </v-data-table>
    
    <!-- Dialogs remain largely the same but could use some glass treatment if visible -->
    <v-dialog
      v-model="newImportDialog"
      transition="dialog-bottom-transition"
      max-width="600px"
    >
      <v-card class="glass-card pa-4">
        <v-card-title class="font-orbitron primary--text headline title-glow mb-4">
          {{ $t("Seasons.Import") }}
        </v-card-title>
        <v-card-text v-html="$t('Seasons.ImportExplanation')" class="white--text opacity-80" />
        <v-card-text>
          <v-form ref="newImportForm">
            <v-text-field
              v-model="challongeInfo.tournament_id"
              ref="ChallongeUrl"
              :label="$t('Seasons.ImportUrl')"
              filled
              class="custom-field"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="newImportDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-6 rounded-lg" @click="importChallongeTeams()">
             {{ $t("misc.Import") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  </v-container>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      teams: [],
      isLoading: true,
      newImportDialog: false,
      challongeInfo: {
        tournament_id: ""
      },
      responseSheet: false,
      response: "",
      options: {
        itemsPerPage: 10
      },
      totalTeams: -1
    };
  },
  watch: {
    newImportDialog(val) {
      if (!val) {
        this.$refs.newImportForm.resetValidation();
        this.challongeInfo = {
          tournament_id: ""
        };
      }
    },
    options: {
      handler() {
        this.GetTeams();
      },
      deep: true
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("Team.ID"),
          align: "start",
          sortable: true,
          value: "id"
        },
        {
          text: this.$t("Team.Name"),
          value: "name"
        },
        {
          text: this.$t("Team.TeamTag"),
          value: "tag",
          sortable: false
        },
        {
          text: this.$t("Team.Flag"),
          value: "flag"
        },
        {
          text: this.$t("Team.Owner"),
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
  },
  methods: {
    async GetTeams() {
      this.isLoading = true;
      this.teams = [];
      let count =
        this.$route.path == "/teams"
          ? await this.GetAllTeams()
          : await this.GetMyTeams();

      const { sortBy, sortDesc, page, itemsPerPage } = this.options;
      if (typeof count == "string") count = [];
      if (sortBy.length === 1 && sortDesc.length === 1) {
        count = count.sort((a, b) => {
          const sortA = a[sortBy[0]];
          const sortB = b[sortBy[0]];
          if (sortDesc[0]) {
            if (sortA < sortB) return 1;
            if (sortA > sortB) return -1;
            return 0;
          } else {
            if (sortA < sortB) return -1;
            if (sortA > sortB) return 1;
            return 0;
          }
        });
      }

      // Filter based on what the user is. Maybe swap this over to the API?
      if (!this.user.id || !this.IsAnyAdmin(this.user)) {
        count = count.filter(
          team => team.public_team == 1 || team.user_id == this.user.id
        );
      }
      this.totalTeams = count.length;
      if (itemsPerPage > 0) {
        count = count.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      }
      this.teams = count;
      this.isLoading = false;
      return;
    },
    async importChallongeTeams() {
      let importData = [this.challongeInfo];
      let isImport = await this.ImportChallongeTeams(importData);
      if (isImport.message.includes("successfully")) {
        this.teams = [];
        this.GetTeams();
        this.response = isImport.message;
        this.responseSheet = true;
        this.newImportDialog = false;
      } else {
        this.response = this.$t("Seasons.ImportError");
        this.responseSheet = true;
        this.$nextTick(() => {
          this.challongeInfo = {
            tournament_id: ""
          };
        });
      }
      return;
    }
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-field ::v-deep .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px !important;
}

.neon-btn {
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

.neon-btn:hover {
  box-shadow: 0 0 25px rgba(0, 242, 255, 0.5);
  transform: translateY(-2px);
}
</style>
