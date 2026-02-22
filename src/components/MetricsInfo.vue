<template>
  <v-row>
    <v-col cols="12" sm="12" md="12" lg="3">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Users") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isUsersLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ userCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="2">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Teams") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isTeamsLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ teamCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="3">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Matches") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isMatchesLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ matchesCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="3">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Complete") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isCompleteLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ matchesComplete }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="3">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Servers") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isServersLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ serverCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="3">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Maps") }}
        </v-card-subtitle>
        <v-skeleton-loader class="mx-auto flex-grow-1 d-flex align-center justify-center my-2" :loading="isMapsLoading" type="text">
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ mapCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="2">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Players") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isPlayersLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ playerCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="2">
      <v-card class="glass-card d-flex flex-column h-100 text-center py-2">
        <v-card-subtitle class="font-orbitron font-weight-bold text-uppercase pb-0">
          {{ $t("Metrics.Seasons") }}
        </v-card-subtitle>
        <v-skeleton-loader
          class="mx-auto flex-grow-1 d-flex align-center justify-center my-2"
          :loading="isSeasonsLoading"
          type="text"
        >
          <div class="display-1 font-orbitron primary--text font-weight-bold">
            {{ seasonCount }}
          </div>
        </v-skeleton-loader>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      allUsers: [],
      allTeams: [],
      allMatches: [],
      allServers: [],
      allMaps: [],
      allUniquePlayers: 0,
      allSeasons: []
    };
  },
  created() {
    this.retrieveMetrics();
  },
  methods: {
    async retrieveMetrics() {
      this.allUsers = await this.GetAllUsers();
      this.allTeams = await this.GetAllTeams();
      this.allMatches = await this.GetAllMatches();
      this.allServers = await this.GetPublicServerCount();
      this.allMaps = await this.GetAllMapStats();
      this.allUniquePlayers = await this.GetAllPlayers();
      this.allSeasons = await this.GetAllSeasons();
      if (typeof this.allUsers == "string") this.allUsers = [];
      if (typeof this.allTeams == "string") this.allTeams = [];
      if (typeof this.allMatches == "string") this.allMatches = [];
      if (typeof this.allServers == "string") this.allServers = [];
      if (typeof this.allMaps == "string") this.allMaps = [];
      if (typeof this.allUniquePlayers == "string") this.allUniquePlayers = 0;
      if (typeof this.allSeasons == "string") this.allSeasons = [];
    }
  },
  computed: {
    userCount() {
      return this.allUsers.length;
    },
    teamCount() {
      return this.allTeams.length;
    },
    matchesCount() {
      return this.allMatches.length;
    },
    matchesComplete() {
      if (typeof this.allMatches == "string") return 0;
      return this.allMatches.filter(mtch => {
        return mtch.cancelled == 0 && mtch.end_time != null;
      }).length;
    },
    serverCount() {
      return this.allServers;
    },
    mapCount() {
      return this.allMaps.filter(mtch => {
        return mtch.end_time != mtch.start_time;
      }).length;
    },
    playerCount() {
      return this.allUniquePlayers;
    },
    seasonCount() {
      return this.allSeasons.length;
    },
    isUsersLoading() {
      if (this.userCount >= 0) return false;
      else return true;
    },
    isTeamsLoading() {
      if (this.teamCount >= 0) return false;
      else return true;
    },
    isMatchesLoading() {
      if (this.matchesCount >= 0) return false;
      else return true;
    },
    isCompleteLoading() {
      if (this.matchesComplete >= 0) return false;
      else return true;
    },
    isServersLoading() {
      if (this.serverCount >= 0) return false;
      else return true;
    },
    isMapsLoading() {
      if (this.mapCount >= 0) return false;
      else return true;
    },
    isPlayersLoading() {
      if (this.playerCount >= 0) return false;
      else return true;
    },
    isSeasonsLoading() {
      if (this.seasonCount >= 0) return false;
      else return true;
    }
  }
};
</script>
