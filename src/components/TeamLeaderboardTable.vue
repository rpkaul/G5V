<template>
  <v-container class="TeamLeaderboard px-0" fluid>
    <v-data-table
      item-key="index"
      class="glass-table custom-table"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="headers"
      :items="teams"
      :sort-by="'wins'"
      :sort-desc="['wins']"
      ref="TeamLeaderboardTable"
    >
      <template v-slot:item.name="{ item }">
        <span class="white--text font-weight-black">{{ item.name }}</span>
      </template>

      <template v-slot:item.wins="{ item }">
        <span class="success--text font-weight-black">{{ item.wins }}</span>
      </template>

      <template v-slot:item.losses="{ item }">
        <span class="error--text font-weight-bold">{{ item.losses }}</span>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "TeamLeaderboard",
  props: {
    seasonid: Number
  },
  data() {
    return {
      teams: [],
      isLoading: true
    };
  },
  created() {
    this.GetLeaderboard();
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("Leaderboard.TName"),
          align: "start",
          sortable: true,
          value: "name",
          groupable: false
        },
        {
          text: this.$t("Leaderboard.TWin"),
          sortable: true,
          value: "wins",
          groupable: false
        },
        {
          text: this.$t("Leaderboard.TLosses"),
          value: "losses",
          groupable: false
        },
        {
          text: this.$t("Leaderboard.TDiff"),
          value: "rounddiff",
          groupable: false
        }
      ];
    }
  },
  methods: {
    async GetLeaderboard() {
      try {
        let res;
        if (this.seasonid)
          res = await this.GetSeasonTeamLeaderboard(this.seasonid);
        else res = await this.GetTeamLeaderboard();
        if (typeof res == "string") return;
        this.teams = res;
      } catch (error) {
        console.log("Our error: " + error);
      } finally {
        this.isLoading = false;
      }
      return;
    }
  }
};
</script>

<style scoped>
/* Redundant table styles removed in favor of global App.vue styles */
</style>
