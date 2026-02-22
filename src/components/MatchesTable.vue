<template>
  <v-data-table
    item-key="name"
    class="glass-table custom-table"
    :loading="isLoading"
    :loading-text="$t('misc.LoadText')"
    :headers="headers"
    :items="matches"
    :options.sync="options"
    :server-items-length="totalMatches"
    ref="MatchesTable"
  >
    <template v-slot:item.id="{ item }">
      <router-link
        :to="{ path: '/match/' + item.id }"
        v-if="item.match_status != 'Cancelled'"
        class="primary--text font-weight-black"
      >
        #{{ item.id }}
      </router-link>
      <div v-else class="grey--text font-weight-bold">
        #{{ item.id }}
      </div>
    </template>
    
    <template v-slot:item.team1_string="{ item }">
      <router-link
        :to="{ path: '/teams/' + item.team1_id }"
        v-if="item.team1_id !== null"
        class="white--text font-weight-bold"
      >
        {{ item.team1_string }}
      </router-link>
      <div v-else class="white--text opacity-70">
        {{ item.team1_string }}
      </div>
    </template>

    <template v-slot:item.team2_string="{ item }">
      <router-link
        :to="{ path: '/teams/' + item.team2_id }"
        v-if="item.team2_id !== null"
        class="white--text font-weight-bold"
      >
        {{ item.team2_string }}
      </router-link>
      <div v-else class="white--text opacity-70">
        {{ item.team2_string }}
      </div>
    </template>

    <template v-slot:item.match_status="{ item }">
      <v-chip
        small
        label
        :color="getStatusColor(item.match_status)"
        class="font-weight-black text-uppercase rounded-lg px-3"
        outlined
      >
        <v-icon left x-small v-if="item.match_status.includes('Live')">mdi-circle</v-icon>
        {{ item.match_status }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn
        depressed
        color="primary"
        class="black--text font-weight-black rounded-lg neon-btn-small"
        :to="{ path: '/match/' + item.id }"
        v-if="item.match_status != 'Cancelled'"
        x-small
      >
        {{ $t("misc.View") }}
      </v-btn>
    </template>

    <template v-slot:top>
      <div class="d-flex align-center px-4 py-2 border-bottom" v-if="isMyMatches && isThereCancelledMatches">
        <v-spacer />
        <v-btn color="cyber-pink" depressed rounded small @click="deleteCancelled" :loading="deletePending" class="black--text font-weight-black">
          <v-icon left size="16">mdi-delete-sweep</v-icon>
          {{ $t("Matches.DeleteButton") }}
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      matches: [],
      isLoading: true,
      isThereCancelledMatches: false,
      totalMatches: -1,
      options: {
        itemsPerPage: 10
      },
      deletePending: false
    };
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("Matches.MatchID"),
          align: "start",
          sortable: true,
          value: "id"
        },
        {
          text: this.$t("Matches.Team1"),
          value: "team1_string"
        },
        {
          text: this.$t("Matches.Team2"),
          value: "team2_string"
        },
        {
          text: this.$t("Matches.Status"),
          value: "match_status",
          sortable: false
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
    },
    isMyMatches() {
      return this.$route.path == "/mymatches";
    }
  },
  watch: {
    options: {
      async handler() {
        await this.pageUpdate();
      },
      deep: true
    }
  },
  methods: {
    async pushMatchData(resultArray) {
      this.isLoading = true;
      let matches = [];
      let matchString;
      let team1Score,
        team2Score = 0;
      resultArray.forEach(async match => {
        if (match.max_maps == 1) {
          team1Score =
            match.team1_mapscore == undefined ? 0 : match.team1_mapscore;
          team2Score =
            match.team2_mapscore == undefined ? 0 : match.team2_mapscore;
        } else {
          team1Score = match.team1_score == undefined ? 0 : match.team1_score;
          team2Score = match.team2_score == undefined ? 0 : match.team2_score;
        }
        if (
          match.end_time == null &&
          (match.cancelled == 0 || match.cancelled == null) &&
          match.start_time != null
        ) {
          matchString = `Live, ${team1Score}:${team2Score} vs ${match.team2_string}`;
        } else if (team1Score < team2Score) {
          matchString = `Lost, ${team1Score}:${team2Score} vs ${match.team2_string}`;
        } else if (team1Score > team2Score) {
          matchString = `Won, ${team1Score}:${team2Score} vs ${match.team2_string}`;
        } else if (match.cancelled == 1) {
          matchString = "Cancelled";
        } else if (team1Score == team2Score && match.forfeit != 1) {
          matchString = `Tied, ${team1Score}:${team2Score} vs ${match.team2_string}`;
        } else if (match.winner == match.team1_id) {
          matchString = `Forfeit win vs ${match.team2_string}`;
        } else if (match.winner == match.team2_id) {
          matchString = `Forfeit loss vs ${match.team2_string}`;
        }
        match.match_status = matchString;
        if (match.cancelled == 1) this.isThereCancelledMatches = true;
        await matches.push(match);
      });
      this.isLoading = false;
      return matches;
    },
    async pageUpdate() {
      let count =
        this.$route.path == "/mymatches"
          ? await this.GetMyMatches()
          : await this.GetAllMatches();
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
      this.totalMatches = count.length;
      if (itemsPerPage > 0) {
        count = count.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      }
      this.matches = await this.pushMatchData(count);
      return;
    },
    async deleteCancelled() {
      this.deletePending = true;
      await this.DeleteMyCancelledMatches();
      this.deletePending = false;
      this.matches = [];
      this.isLoading = true;
      this.isThereCancelledMatches = false;
      await this.pageUpdate();
    },
    getStatusColor(status) {
      if (!status) return "grey";
      if (status.includes("Won")) return "success";
      if (status.includes("Lost")) return "error";
      if (status.includes("Live")) return "primary";
      if (status.includes("Cancelled")) return "grey darken-1";
      return "secondary";
    }
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.opacity-70 {
  opacity: 0.7;
}
</style>
