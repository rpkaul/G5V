<template>
  <v-container class="vetoInfo" fluid v-if="vetoInfo.length > 1">
    <v-data-table
      :headers="headers"
      :items="vetoInfo"
      class="custom-table"
      :sort-by="['id']"
      hide-default-footer
      :no-data-text="$t('Veto.NoData')"
      :expanded.sync="expanded"
      show-expand
    >
      <template v-slot:item.map="{ item }">
        <b v-if="item.pick_or_veto === 'pick'">
          {{ item.map }}
        </b>
        <div v-else>
          {{ item.map }}
        </div>
      </template>
      <template v-slot:item.pick_or_veto="{ item }">
        <b v-if="item.pick_or_veto === 'pick'">
          {{ $t("Veto.VetoPick") }}
        </b>
        <div
          v-else-if="
            item.pick_or_veto === 'ban' || item.pick_or_veto === 'veto'
          "
        >
          {{ $t("Veto.VetoBan") }}
        </div>
        <div v-else>
          {{ item.pick_or_veto }}
        </div>
      </template>
      <template v-slot:item.team_name="{ item }">
        <b v-if="item.pick_or_veto === 'pick'">
          <div v-if="item.team_name === 'Decider'">
            {{ $t("Veto.DeciderTeam") }}
          </div>
          <div v-else>
            {{ item.team_name }}
          </div>
        </b>
        <div v-else>
          {{ item.team_name }}
        </div>
      </template>

      <template
        v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }"
      >
        <v-icon
          v-if="item.side"
          :class="[
            'v-data-table__expand-icon',
            { 'v-data-table__expand-icon--active': isExpanded }
          ]"
          @click.stop="expand(!isExpanded)"
          >$expand</v-icon
        >
      </template>

      <template v-slot:expanded-item="{ item, headers }">
        <td :colspan="headers.length">
          <v-data-table
            item-key="id"
            class="custom-table"
            :headers="additionalHeaders"
            hide-default-footer
            dense
            :key="item.id"
            :items="[item]"
            disable-sort
            :colspan="headers.length"
          />
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
let vetoInformation;
let vetoSideInformation;
export default {
  props: {
    match_id: Number
  },
  sse: {
    cleanup: true
  },
  data() {
    return {
      vetoInfo: [
        {
          id: -1,
          match_id: -1,
          team_name: "",
          team_name_side: null,
          map: "",
          pick_or_veto: "",
          side: ""
        }
      ],
      expanded: []
    };
  },
  mounted() {
    this.useStreamOrStaticData();
  },
  methods: {
    async useStreamOrStaticData() {
      // Template will contain v-rows/etc like on main Team page.
      let matchData = await this.GetMatchData(this.match_id);
      if (matchData.skip_veto === 1) {
         this.getVetoInfo(matchData);
         return;
      }
      if (matchData.end_time == null) this.getStreamedVetoInfo();
      else this.getVetoInfo(matchData);
    },
    async getStreamedVetoInfo() {
      try {
        vetoInformation = await this.GetStreamedVetoesOfMatch(this.match_id);
        vetoSideInformation = await this.GetStreamedVetoSidesOfMatch(
          this.match_id
        );
        // Remove the -1 value.
        this.vetoInfo.pop();
        await vetoInformation.on("vetodata", this.handleVetoInfo).connect();
        await vetoSideInformation
          .on("vetosidedata", this.handleLiveSideInfo)
          .connect();
      } catch (err) {
        console.error(`Error on SSE ${err}`);
      }
    },
    async handleVetoInfo(liveVetoInfo) {
      await liveVetoInfo.forEach(vetoData => {
        let isFound = this.vetoInfo.find(tmp => {
          return tmp["id"] === vetoData.id;
        });
        if (!isFound) {
          this.vetoInfo.push({
            id: vetoData.id,
            match_id: vetoData.match_id,
            team_name: vetoData.team_name,
            map: vetoData.map,
            pick_or_veto: vetoData.pick_or_veto
          });
        }
      });
      // Update veto information here.
      let mapStatRes = await this.GetMapStats(this.match_id);
      if (typeof mapStatRes != "string") this.mapStats = mapStatRes;
    },
    async handleLiveSideInfo(liveSideInfo) {
      await liveSideInfo.forEach(liveVetoData => {
        this.vetoInfo.forEach((vetoData, idx) => {
          if (liveVetoData["veto_id"] === vetoData["id"]) {
            this.vetoInfo.splice(idx, 1);
            this.vetoInfo.push({
              id: vetoData.id,
              match_id: vetoData.match_id,
              team_name: vetoData.team_name,
              map: vetoData.map,
              pick_or_veto: vetoData.pick_or_veto,
              team_name_side: liveVetoData.team_name,
              side: liveVetoData.side
            });
          }
        });
      });
    },
    async getVetoInfo(matchDataObj) {
      try {
        let matchData = matchDataObj || await this.GetMatchData(this.match_id);
        let vetoRes = await this.GetVetoesOfMatch(this.match_id);
        if (typeof vetoRes != "string" && vetoRes.length > 0) {
          this.vetoInfo = vetoRes;
        } else {
          // If no vetoes found, try to use mapstats or matchData.veto_mappool for preset matches
          let presetMaps = [];
          let mapStats = await this.GetMapStats(this.match_id);
          
          if (matchData.skip_veto === 1 && matchData.veto_mappool) {
             let maps = matchData.veto_mappool.trim().split(" ");
             let sides = matchData.map_sides ? matchData.map_sides.split(",") : [];
             
             maps.forEach((mapName, idx) => {
                let stat = null;
                if (typeof mapStats != "string" && mapStats.length > 0) {
                   stat = mapStats.find(s => s.map_number === idx);
                }
                
                let sideInfo = sides[idx] || "";
                let tName = this.$t("Veto.DeciderTeam");
                
                if (sideInfo !== "knife") {
                   let t1Name = matchData.team1?.name || matchData.team1_string || "Team 1";
                   let t2Name = matchData.team2?.name || matchData.team2_string || "Team 2";
                   tName = idx % 2 === 0 ? t1Name : t2Name;
                }
                
                let pickStatus = "pick";
                if (!stat && matchData.end_time != null) {
                   pickStatus = "Not Played";
                }

                presetMaps.push({
                   id: idx,
                   match_id: matchData.id,
                   team_name: tName,
                   map: mapName,
                   pick_or_veto: pickStatus
                });
             });
             this.vetoInfo = presetMaps;
          } else if (typeof mapStats != "string" && mapStats.length > 0) {
             // Fallback for non-preset matches if no veto data exists
             mapStats.forEach(stat => {
                presetMaps.push({
                   id: stat.map_number,
                   match_id: stat.match_id,
                   team_name: this.$t("Veto.DeciderTeam"),
                   map: stat.map_name,
                   pick_or_veto: "pick"
                });
             });
             this.vetoInfo = presetMaps;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    expandAll: function() {
      this.expanded = this.people.filter(item => item.description);
    },
    collapseAll: function() {
      this.expanded = [];
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("Veto.TeamHeader"),
          sortable: false,
          align: "start",
          value: "team_name"
        },
        {
          text: this.$t("Veto.MapHeader"),
          sortable: false,
          value: "map"
        },
        {
          text: this.$t("Veto.PickBan"),
          sortable: false,
          value: "pick_or_veto"
        },
        {
          text: "",
          value: "data-table-expand"
        }
      ];
    },
    additionalHeaders() {
      return [
        {
          text: this.$t("Veto.TeamHeader"),
          value: "team_name_side"
        },
        {
          text: this.$t("Veto.MapHeader"),
          sortable: false,
          value: "map"
        },
        {
          text: this.$t("Veto.SidePick"),
          sortable: false,
          value: "side"
        }
      ];
    }
  }
};
</script>
