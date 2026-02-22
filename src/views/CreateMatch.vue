<template>
  <v-container class="glass-container" fluid>
    <div class="glass-header mb-8">
      <v-icon color="primary" size="32" class="mr-3">mdi-plus-circle-outline</v-icon>
      <h1 class="font-orbitron primary--text headline m-0">
        {{ $t("Navbar.CreateMatch") }}
      </h1>
    </div>

    <v-row>
      <v-col cols="12">
        <v-card class="glass-card">
          <NewMatchForm :user="user" v-if="user.id != -1" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import NewMatchForm from "@/components/NewMatchForm";
export default {
  name: "Match",
  components: {
    NewMatchForm
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
