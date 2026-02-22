<template>
  <v-container class="team-profile-dashboard pa-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="glass-card pa-4 mb-6">
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="secondary" class="mr-3" size="32">mdi-account-group</v-icon>
            <h2 class="font-orbitron white--text headline title-glow">Team Profile</h2>
          </div>
          <TeamTable v-if="user" :user="user" :newTeam="newTeam" />
        </v-card>

        <v-card class="glass-card pa-4">
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="primary" class="mr-3" size="32">mdi-history</v-icon>
            <h2 class="font-orbitron white--text headline title-glow">{{ title }}</h2>
          </div>
          <MatchTable class="justify-center" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import TeamTable from "@/components/TeamTable";
import MatchTable from "@/components/MatchesTableNoLimits";
export default {
  name: "Team",
  components: {
    TeamTable,
    MatchTable
  },
  data() {
    return {
      newTeam: false,
      title: "Recent Matches",
      user: {
        admin: false,
        steam_id: "",
        id: -1,
        super_admin: false,
        name: "",
        small_image: "",
        medium_image: "",
        large_image: ""
      }
    };
  },
  async created() {
    this.user = await this.IsLoggedIn();
    if (this.$route.params.id == "create") this.newTeam = true;
  }
};
</script>
