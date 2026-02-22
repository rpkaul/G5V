<template>
  <div class="d-flex flex-wrap justify-space-between stat-container mx-n2">
    <div class="pa-2 flex-grow-1" style="flex-basis: 140px; min-width: 140px;">
      <v-card class="glass-card pa-2 d-flex flex-column h-100">
        <v-card-title class="font-orbitron secondary--text subtitle-2 text-uppercase text-truncate px-2 pt-2 pb-0" style="letter-spacing: 1px;">
          {{ $t("PlayerStats.Kills") }}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-skeleton-loader class="mx-auto" :loading="isKillsLoading" type="text">
          <v-card-text class="headline white--text font-weight-bold text-center px-2 pb-2">
            {{ totalKills }}
          </v-card-text>
        </v-skeleton-loader>
      </v-card>
    </div>

    <div class="pa-2 flex-grow-1" style="flex-basis: 140px; min-width: 140px;">
      <v-card class="glass-card pa-2 d-flex flex-column h-100">
        <v-card-title class="font-orbitron secondary--text subtitle-2 text-uppercase text-truncate px-2 pt-2 pb-0" style="letter-spacing: 1px;">
          {{ $t("PlayerStats.Deaths") }}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-skeleton-loader class="mx-auto" :loading="isDeathsLoading" type="text">
          <v-card-text class="headline white--text font-weight-bold text-center px-2 pb-2">
            {{ totalDeaths }}
          </v-card-text>
        </v-skeleton-loader>
      </v-card>
    </div>

    <div class="pa-2 flex-grow-1" style="flex-basis: 140px; min-width: 140px;">
      <v-card class="glass-card pa-2 d-flex flex-column h-100">
        <v-card-title class="font-orbitron secondary--text subtitle-2 text-uppercase text-truncate px-2 pt-2 pb-0" style="letter-spacing: 1px;">
          {{ $t("PlayerStats.Headshot") }}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-skeleton-loader class="mx-auto" :loading="isHSPLoading" type="text">
          <v-card-text class="headline white--text font-weight-bold text-center px-2 pb-2">
            {{ headShotPercentage }}%
          </v-card-text>
        </v-skeleton-loader>
      </v-card>
    </div>

    <div class="pa-2 flex-grow-1" style="flex-basis: 140px; min-width: 140px;">
      <v-card class="glass-card pa-2 d-flex flex-column h-100">
        <v-card-title class="font-orbitron secondary--text subtitle-2 text-uppercase text-truncate px-2 pt-2 pb-0" style="letter-spacing: 1px;">
          {{ $t("PlayerStats.RoundsPlayed") }}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-skeleton-loader class="mx-auto" :loading="isTotalRoundsLoading" type="text">
          <v-card-text class="headline white--text font-weight-bold text-center px-2 pb-2">
            {{ totalRoundsPlayed }}
          </v-card-text>
        </v-skeleton-loader>
      </v-card>
    </div>

    <div class="pa-2 flex-grow-1" style="flex-basis: 140px; min-width: 140px;">
      <v-card class="glass-card pa-2 d-flex flex-column h-100">
        <v-card-title class="font-orbitron secondary--text subtitle-2 text-uppercase text-truncate px-2 pt-2 pb-0" style="letter-spacing: 1px;">
          {{ $t("PlayerStats.Rating") }}
        </v-card-title>
        <v-spacer></v-spacer>
        <v-skeleton-loader class="mx-auto" :loading="isRatingLoading" type="text">
          <v-card-text class="headline white--text font-weight-bold text-center px-2 pb-2">
            {{ averageRating }}
          </v-card-text>
        </v-skeleton-loader>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    statArray: Array
  },
  computed: {
    totalKills() {
      let allKills = 0;
      if (this.statArray.length > 0)
        this.statArray.forEach(stat => {
          allKills += stat.kills;
        });
      return allKills;
    },
    totalDeaths() {
      let allDeaths = 0;
      if (this.statArray.length > 0)
        this.statArray.forEach(stat => {
          allDeaths += stat.deaths;
        });
      return allDeaths;
    },
    totalRoundsPlayed() {
      let allRounds = 0;
      if (this.statArray.length > 0)
        this.statArray.forEach(stat => {
          allRounds += stat.roundsplayed;
        });
      return allRounds;
    },
    headShotPercentage() {
      let allKills = 0;
      let headshotKills = 0;
      if (this.statArray.length > 0)
        this.statArray.forEach(stat => {
          allKills += stat.kills;
          headshotKills += stat.headshot_kills;
        });
      if (allKills > 0) return ((headshotKills / allKills) * 100).toFixed(2);
      return allKills;
    },
    averageRating() {
      let totalRating = 0;
      if (this.statArray.length > 0)
        this.statArray.forEach(stat => {
          totalRating += Number(
            this.GetRating(
              stat.kills,
              stat.roundsplayed,
              stat.deaths,
              stat.k1,
              stat.k2,
              stat.k3,
              stat.k4,
              stat.k5
            )
          );
        });
      if (totalRating > 0)
        return (totalRating / this.statArray.length).toFixed(2);
      return 0;
    },
    isKillsLoading() {
      if (this.totalKills >= 0) return false;
      else return true;
    },
    isTotalRoundsLoading() {
      if (this.totalRoundsPlayed >= 0) return false;
      else return true;
    },
    isDeathsLoading() {
      if (this.totalDeaths >= 0) return false;
      else return true;
    },
    isHSPLoading() {
      if (this.headShotPercentage >= 0) return false;
      else return true;
    },
    isRatingLoading() {
      if (this.averageRating >= 0) return false;
      else return true;
    }
  }
};
</script>
