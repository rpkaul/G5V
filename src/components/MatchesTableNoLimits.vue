<template>
  <v-data-table
    item-key="name"
    class="glass-table custom-table"
    :loading="isLoading"
    :loading-text="$t('misc.LoadText')"
    :headers="headers"
    :items="matches"
    :sort-by="['id']"
    sort-desc
    ref="MatchesTable"
  >
    <template v-slot:item.id="{ item }">
      <router-link
        :to="{ path: '/match/' + item.id }"
        v-if="item.match_status != 'Cancelled'"
        class="primary--text font-weight-black hover-link"
      >
        #{{ item.id }}
      </router-link>
      <div v-else class="grey--text font-weight-bold">
        #{{ item.id }}
      </div>
    </template>
    <template v-slot:item.owner="{ item }">
      <router-link :to="{ path: '/user/' + item.user_id }" class="secondary--text font-weight-bold hover-link">
        {{ item.owner }}
      </router-link>
    </template>
    <template v-slot:item.team1_string="{ item }">
      <router-link
        :to="{ path: '/teams/' + item.team1_id }"
        v-if="item.team1_id !== null"
        class="white--text font-weight-bold hover-link"
      >
        {{ item.team1_string }}
      </router-link>
      <div v-else class="white--text font-weight-bold">
        {{ item.team1_string }}
      </div>
    </template>
    <template v-slot:item.team2_string="{ item }">
      <router-link
        :to="{ path: '/teams/' + item.team2_id }"
        v-if="item.team2_id !== null"
        class="white--text font-weight-bold hover-link"
      >
        {{ item.team2_string }}
      </router-link>
      <div v-else class="white--text font-weight-bold">
        {{ item.team2_string }}
      </div>
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
      <div v-if="isMyMatches && isThereCancelledMatches">
        <v-toolbar flat>
          <v-toolbar-title>
            <v-btn primary @click="deleteCancelled" :loading="deletePending">
              {{ $t("Matches.DeleteButton") }}
            </v-btn>
          </v-toolbar-title>
        </v-toolbar>
      </div>
      <div v-else />
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
      deletePending: false,
      isThereCancelledMatches: false
    };
  },
  created() {
    this.GetMatches();
  },
  computed: {
    myMatches() {
      return (
        this.$route.path != "/mymatches" &&
        this.$route.path != "/" &&
        !this.$route.path.toString().includes("season")
      );
    },
    isMyMatches() {
      return this.$route.path == "/mymatches";
    },
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
          value: "match_status"
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
  },
  methods: {
    async GetMatches() {
      try {
        let res;
        if (this.$route.path == "/mymatches") res = await this.GetMyMatches();
        else if (this.$route.path.includes("team"))
          res = await this.GetTeamRecentMatches(this.$route.params.id);
        else if (this.$route.path.includes("user")) {
          if (this.$route.params.id == undefined) {
            res = await this.GetUserRecentMatches(this.user.id);
          } else res = await this.GetUserRecentMatches(this.$route.params.id);
          if (res.length == 0)
            res = await this.GetPlayerStatRecentMatches(this.$route.params.id);
        } else if (this.$route.path.includes("season"))
          res = await this.GetSeasonRecentMatches(this.$route.params.id);
        else res = await this.GetAllMatches();
        if (typeof res == "string") res = [];
        else {
          res.forEach(async match => {
            const ownerRes = await this.GetUserData(match.user_id);
            let teamId =
              match.team1_id == null ? match.team2_id : match.team1_id;
            const statusRes = await this.GetMatchResult(teamId, match.id);
            match.owner = ownerRes.name;
            match.match_status = statusRes;
            if (match.cancelled == 1) this.isThereCancelledMatches = true;
            this.matches.push(match);
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    async deleteCancelled() {
      this.deletePending = true;
      await this.DeleteMyCancelledMatches();
      this.deletePending = false;
      this.matches = [];
      this.isLoading = true;
      this.isThereCancelledMatches = false;
      await this.GetMatches();
    }
  }
};
</script>

<style scoped>
/* Redundant table styles removed in favor of global App.vue styles */
</style>
