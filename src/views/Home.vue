<template>
  <v-container class="home-dashboard pa-0" fluid>
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon color="primary" class="mr-3" size="32">mdi-broadcast</v-icon>
          <h2 class="font-orbitron white--text headline title-glow">{{ $t("Match.LiveMatches") }}</h2>
          <v-spacer />
          <v-btn text color="primary" to="/matches" class="font-weight-bold">
            {{ $t("Navbar.AllMatches") }}
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
        <MatchCards />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6" class="mb-4">
        <div class="d-flex align-center mb-6">
          <v-icon color="secondary" class="mr-3" size="32">mdi-account-group</v-icon>
          <h2 class="font-orbitron white--text headline">{{ $t("Navbar.AllTeams") }}</h2>
        </div>
        <TeamLeaderBoard />
      </v-col>
      <v-col cols="12" lg="6" class="mb-4">
        <div class="d-flex align-center mb-6">
          <v-icon color="accent" class="mr-3" size="32">mdi-medal</v-icon>
          <h2 class="font-orbitron white--text headline">{{ $t("Navbar.PlayerLeader") }}</h2>
        </div>
        <PlayerLeaderBoard />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import TeamLeaderBoard from "@/components/TeamLeaderboardTable";
import PlayerLeaderBoard from "@/components/PlayerLeaderboardTable";
import MatchCards from "@/components/MatchCard";
export default {
  name: "Home",
  components: {
    TeamLeaderBoard,
    MatchCards,
    PlayerLeaderBoard
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
