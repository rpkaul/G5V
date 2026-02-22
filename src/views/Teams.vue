<template>
  <v-container class="teams-dashboard pa-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="glass-card pa-4">
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="secondary" class="mr-3" size="32">mdi-account-group</v-icon>
            <h2 class="font-orbitron white--text headline title-glow">{{ $t("Navbar.AllTeams") }}</h2>
          </div>
          <TeamsTable :user="user" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import TeamsTable from "@/components/TeamsTable";
export default {
  name: "Teams",
  components: {
    TeamsTable
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
