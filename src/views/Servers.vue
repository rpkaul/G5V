<template>
  <v-container class="servers-dashboard pa-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="glass-card pa-4">
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="primary" class="mr-3" size="32">mdi-server-network</v-icon>
            <h2 class="font-orbitron white--text headline title-glow">{{ $t("MyServers.Title") }}</h2>
          </div>
          <ServersTable v-if="user.id != -1" :user="user" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import ServersTable from "@/components/ServersTable";
export default {
  name: "Servers",
  components: {
    ServersTable
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
      }
    };
  },
  async mounted() {
    this.user = await this.IsLoggedIn();
  }
};
</script>
