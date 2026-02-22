<template>
  <v-container class="season-dashboard pa-6" fluid>
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <v-card class="glass-card pa-6 mb-6">
          <div class="d-flex align-center flex-wrap mb-6">
            <v-icon color="accent" class="mr-3" size="32">mdi-trophy</v-icon>
            <h1 class="font-orbitron white--text headline mr-4 mb-0">{{ seasonData.name }}</h1>
            
            <v-chip-group v-if="seasonData.start_date">
              <v-chip color="primary" label outlined small class="mr-2">
                {{ isStarted.toUpperCase() }}: {{ new Date(seasonData.start_date).toLocaleDateString() }}
              </v-chip>
              <v-chip v-if="seasonData.end_date" color="secondary" label outlined small>
                {{ isEnding.toUpperCase() }}: {{ new Date(seasonData.end_date).toLocaleDateString() }}
              </v-chip>
            </v-chip-group>

            <v-spacer />
            
            <div class="d-flex">
              <v-btn depressed color="primary" class="black--text font-weight-bold mr-2" rounded :to="`/leaderboard/${seasonData.id}`">
                <v-icon left>mdi-medal</v-icon>
                {{ $t("misc.PLeader") }}
              </v-btn>
              <v-btn depressed outlined color="secondary" class="font-weight-bold" rounded :to="`/leaderboard/teams/${seasonData.id}`">
                <v-icon left>mdi-account-group</v-icon>
                {{ $t("Leaderboard.TTitle") }}
              </v-btn>
            </div>
          </div>

          <v-divider class="my-6 opacity-10" />
          
          <div class="d-flex align-center mb-6 px-4">
            <v-icon color="primary" class="mr-2">mdi-sword-cross</v-icon>
            <span class="font-orbitron white--text subtitle-1">Season Matches</span>
          </div>
          <MatchesTable :user="user" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
import MatchesTable from "@/components/MatchesTableNoLimits";
export default {
  name: "Season",
  components: {
    MatchesTable
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
      seasonData: {
        name: "",
        id: -1,
        user_id: -1,
        start_date: null,
        end_date: null
      }
    };
  },
  async created() {
    this.user = await this.IsLoggedIn();
    this.seasonData = await this.GetSeasonInfo(this.$route.params.id);
    this.seasonData.start_date = new Date(this.seasonData.start_date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    if (this.seasonData.end_date != null)
      this.seasonData.end_date = new Date(this.seasonData.end_date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
  },
  computed: {
    isStarted() {
      if (
        this.seasonData.start_date >=
        new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      )
        return "Starting";
      else return "Started";
    },
    isEnding() {
      if (
        this.seasonData.end_date != null &&
        this.seasonData.end_date <
          new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
      )
        return "Ended";
      else return "Ends";
    }
  }
};
</script>
