<template>
  <v-container class="px-0">
    <v-row v-for="(mtch, idx) in matches" :key="mtch.id" justify="center">
      <v-col lg="10" md="12" sm="12" xs="12">
        <v-card class="glass-card match-card-root overflow-hidden" :to="'/match/' + mtch.id">
          <v-img
            :src="'/img/maps/' + mtch.map_name + '.jpg'"
            height="180px"
            gradient="to right, rgba(10,10,12,0.95) 20%, rgba(10,10,12,0.4) 50%, rgba(10,10,12,0.95) 80%"
            @error="imageError(idx)"
          >
            <v-row class="fill-height ma-0" align="center" justify="space-between">
              <!-- Team 1 -->
              <v-col cols="4" class="text-right pr-6">
                <div class="team-name primary--text font-weight-bold text-uppercase">
                  {{ mtch.team1_string }}
                </div>
              </v-col>

              <!-- Score & Info -->
              <v-col cols="4" class="text-center">
                <div class="match-type grey--text text-overline mb-1">BO{{ mtch.max_maps }}</div>
                <div class="score-display white--text font-weight-black">
                  <span class="score-num cyan-glow">{{ mtch.team1_score }}</span>
                  <span class="score-divider mx-4">:</span>
                  <span class="score-num pink-glow">{{ mtch.team2_score }}</span>
                </div>
                <div class="map-label primary--text caption text-uppercase mt-1">
                  {{ mtch.map_name }}
                </div>
              </v-col>

              <!-- Team 2 -->
              <v-col cols="4" class="text-left pl-6">
                <div class="team-name secondary--text font-weight-bold text-uppercase">
                  {{ mtch.team2_string }}
                </div>
              </v-col>
            </v-row>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      matches: [],
      isLoading: true,
      deletePending: false,
      isThereCancelledMatches: false
    };
  },
  async mounted() {
    await this.GetLimitedMatches();
  },
  methods: {
    async GetLimitedMatches() {
      try {
        let res;
        res = await this.GetLimitMatches(3);
        if (typeof res == "string") res = [];
        else {
          res.forEach(async match => {
            let mapStats = await this.GetSingleMapStat(match.id, 0);
            if (match.max_maps == 1) {
              match.team1_score =
                mapStats.team1_score == null
                  ? match.team1_score
                  : mapStats.team1_score;
              match.team2_score =
                mapStats.team2_score == null
                  ? match.team2_score
                  : mapStats.team2_score;
            }
            match.map_name = mapStats.map_name;
            match.img_error = false;
            this.matches.push(match);
          });
          this.matches.sort((a, b) => {
            return a.id - b.id;
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    imageError(matchIdx) {
      this.matches[matchIdx].map_name = "_unknown";
      return;
    }
  },
  computed: {
    gradientCalc() {
      if (!this.$vuetify.theme.dark)
        return "to bottom, rgba(255,255,255,.4), rgba(255,255,255,1)";
      else return "to bottom, rgba(0,0,0,.4), rgba(0,0,0,1)";
    }
  }
};
</script>

<style scoped>
.match-card-root {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 1px solid rgba(0, 242, 255, 0.1) !important;
}

.match-card-root:hover {
  transform: scale(1.02);
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.2) !important;
}

.team-name {
  font-family: "Orbitron", sans-serif !important;
  font-size: 1.2rem;
  letter-spacing: 1px;
}

.score-display {
  font-family: "Orbitron", sans-serif !important;
  font-size: 2.5rem;
  line-height: 1;
}

.cyan-glow {
  text-shadow: 0 0 15px var(--neon-cyan);
}

.pink-glow {
  text-shadow: 0 0 15px var(--cyber-pink);
}

.score-divider {
  opacity: 0.5;
  font-size: 1.5rem;
}

.match-type {
  letter-spacing: 4px !important;
}
</style>
