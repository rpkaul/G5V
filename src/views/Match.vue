<template>
  <v-container class="match-cockpit pa-6" fluid>
    <v-row>
      <!-- Main Match Status & Controls -->
      <v-col cols="12" lg="8">
        <v-card class="glass-card mb-6 pa-4">
          <MatchInfo
            v-if="this.$route.params.id != null"
            :match_id="Number(this.$route.params.id)"
            :user="user"
          />
        </v-card>
      </v-col>

      <!-- Sidebar Info (Veto, etc.) -->
      <v-col cols="12" lg="4">
        <v-card class="glass-card pa-4 mb-6">
          <div 
            class="d-flex align-center mb-0 px-4 cursor-pointer" 
            @click="showVeto = !showVeto"
            style="cursor: pointer;"
          >
            <v-icon color="secondary" class="mr-2">mdi-map-marker-path</v-icon>
            <span class="font-orbitron white--text subtitle-1">Veto & Map Pool</span>
            <v-spacer />
            <v-icon color="grey lighten-1">{{ showVeto ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </div>
          <v-expand-transition>
            <div v-show="showVeto" class="mt-4">
              <VetoInfo :match_id="Number(this.$route.params.id)" />
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- Player Statistics Row -->
    <v-row>
      <v-col cols="12">
        <v-card class="glass-card pa-4 mb-6">
          <div class="d-flex align-center mb-4 px-4">
            <v-icon color="primary" class="mr-2">mdi-chart-areaspline</v-icon>
            <span class="font-orbitron white--text subtitle-1">Player Statistics</span>
          </div>
          <PlayerStats :user="user" :match_id="Number(this.$route.params.id)" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import PlayerStats from "@/components/PlayerStatTable";
import MatchInfo from "@/components/MatchInfo";
import VetoInfo from "@/components/VetoTable";
export default {
  name: "Match",
  components: {
    PlayerStats,
    MatchInfo,
    VetoInfo
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
      }, // should be object from JSON response
      showVeto: true
    };
  },
  async mounted() {
    this.user = await this.IsLoggedIn();
  }
};
</script>
