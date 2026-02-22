<template>
  <v-container class="PlayerLeaderboard px-0" fluid>
    <v-data-table
      item-key="steamId"
      class="glass-table custom-table"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="headers"
      :items="players"
      :sort-by="['wins', 'kills']"
      :sort-desc="['wins', 'kills']"
      multi-sort
      ref="PlayerLeaderboardTable"
      :expanded="[]"
      show-expand
      :items-per-page="10"
    >
      <template v-slot:item.name="{ item }">
        <router-link :to="{ path: '/user/' + item.steamId }" class="primary--text font-weight-black hover-link">
          {{ item.name }}
        </router-link>
      </template>

      <template v-slot:item.average_rating="{ item }">
        <v-chip small label color="secondary" outlined class="font-weight-black rounded-lg">
          {{ item.average_rating }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          depressed
          color="primary"
          class="black--text font-weight-black rounded-lg neon-btn-small"
          :to="{ path: '/user/' + item.steamId }"
          x-small
        >
          {{ $t("misc.View") }}
        </v-btn>
      </template>

      <template v-slot:expanded-item="{ item }">
        <td :colspan="headers.length" class="pa-0 expanded-zone border-bottom">
          <v-data-table
            item-key="steamId"
            class="transparent dense-table"
            :headers="additionalHeaders"
            hide-default-footer
            dense
            :key="item.steamId"
            :items="[item]"
            disable-sort
          />
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "PlayerLeaderboard",
  props: {
    seasonId: Number
  },
  data() {
    return {
      players: [],
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
          text: this.$t("PlayerStats.User"),
          align: "start",
          sortable: true,
          value: "name",
          groupable: false
        },
        {
          text: this.$t("misc.TWins"),
          sortable: true,
          value: "wins",
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
          text: this.$t("PlayerStats.Assists"),
          value: "assists",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.FlashbangAssists"),
          value: "fba",
          groupable: false
        },
        {
          text: this.$t("PlayerStats.TotalRoundsPlayed"),
          value: "trp"
        },
        {
          text: this.$t("PlayerStats.Rating"),
          value: "average_rating",
          groupable: false
        },
        {
          text: "",
          value: "actions",
          groupable: false,
          align: "end"
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
          text: this.$t("PlayerStats.ADR"),
          value: "adr"
        },
        {
          text: this.$t("PlayerStats.Headshot") + "%",
          value: "hsp"
        },
        {
          text: this.$t("PlayerStats.5kill"),
          value: "k5"
        },
        {
          text: this.$t("PlayerStats.4kill"),
          value: "k4"
        },
        {
          text: this.$t("PlayerStats.3kill"),
          value: "k3"
        },
        {
          text: this.$t("PlayerStats.2kill"),
          value: "k2"
        },
        {
          text: this.$t("PlayerStats.1kill"),
          value: "k1"
        },
        {
          text: this.$t("PlayerStats.v5"),
          value: "v5"
        },
        {
          text: this.$t("PlayerStats.v4"),
          value: "v4"
        }
      ];
    }
  },
  methods: {
    async GetLeaderboard() {
      try {
        let res;
        if (this.seasonId)
          res = await this.GetSeasonPlayerLeaderboard(this.seasonId);
        else res = await this.GetTotalPlayerLeaderboard();
        if (typeof res == "string") return;
        res.forEach(player => {
          player.adr =
            player.roundsplayed === 0
              ? 0.0
              : (player.total_damage / player.trp).toFixed(2);
          this.players.push(player);
        });
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
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.expanded-zone {
  background: rgba(0, 0, 0, 0.2) !important;
}

.dense-table ::v-deep th {
  font-size: 0.75rem !important;
  color: var(--neon-purple) !important;
}
</style>
