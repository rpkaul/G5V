<template>
  <v-container class="TeamLeaderboard" fluid>
    <v-data-table style="background-image: linear-gradient(to right top, #052437, #004254, #006364, #1a8264, #689f59);border-radius:20px;"
      item-key="index"
      class="elevation-1"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="headers"
      :items="teams"
      :sort-by="'wins'"
      :sort-desc="['wins']"
      ref="TeamLeaderboardTable"
    >
      <template v-slot:top>
        <v-toolbar flat style="border-top-left-radius:20px;border-top-right-radius: 20px;">
          {{ $t("Leaderboard.TTitle") }}
        </v-toolbar>
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

<style lang="scss">
tbody {
  tr:hover {
    background: #0a9489d6 !important;
  }
  td:first-child {
    color: #d4e157;
  }
}
</style>