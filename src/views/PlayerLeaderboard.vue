<template>
  <v-container class="leaderboard-dashboard pa-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="glass-card pa-4">
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="accent" class="mr-3" size="32">mdi-medal</v-icon>
            <h2 class="font-orbitron white--text headline title-glow">{{ $t("Navbar.PlayerLeader") }}</h2>
          </div>
          <PlayerLeaderboardTable :seasonId="parseInt(this.$route.params.seasonid)" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import PlayerLeaderboardTable from "@/components/PlayerLeaderboardTable.vue";
export default {
  name: "PlayerLeaderboard",
  components: {
    PlayerLeaderboardTable
  },
  data() {
    return {
      user: {
        admin: false,
        steam_id: "",
        id: -1,
        super_admin: false,
        name: "",
        small_image: "",
        medium_image: "",
        large_image: ""
      } // should be object from JSON response
    };
  },
  async mounted() {
    this.user = await this.IsLoggedIn();
  }
};
</script>
