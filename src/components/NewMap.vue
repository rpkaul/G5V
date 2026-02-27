<template>
  <v-container class="maplist" fluid>
    <v-item-group v-model="Selected" multiple>
      <v-row>
        <v-col
          v-for="mapInfo in MapList"
          :key="mapInfo.id"
          cols="12"
          sm="12"
          md="12"
          lg="3"
          class="d-flex"
        >
          <v-card class="glass-card d-flex flex-column overflow-hidden" style="width: 100%; min-height: 280px;">
            <div class="flex-grow-1">
              <v-card-title class="font-orbitron primary--text"> {{ mapInfo.map_display_name }} </v-card-title>
              <v-card-subtitle class="pb-0">
                <div class="text-caption mb-2">{{ mapInfo.map_name }}</div>
                <v-checkbox
                  v-model="mapInfo.enabled"
                  :label="$t('User.MapEnabled')"
                  readonly
                  disabled
                  dense
                  hide-details
                  class="custom-checkbox mt-0 pe-none"
                  color="primary"
                />
              </v-card-subtitle>
            </div>
            <v-card-actions class="d-flex pa-4 pt-2 mt-auto">
                <v-btn
                  class="neon-btn-small"
                  fab
                  icon
                  height="36px"
                  width="36px"
                  color="error"
                  @click="
                    selectedMap = mapInfo;
                    deleteDialog = true;
                  "
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn
                  class="neon-btn-small ml-2"
                  fab
                  icon
                  height="36px"
                  width="36px"
                  color="secondary"
                  @click="mapInfo.reveal = true"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </v-card-actions>
              <v-expand-transition>
                <v-card
                  v-if="mapInfo.reveal"
                  class="transition-fast-in-fast-out v-card--reveal d-flex flex-column pt-0 glass-card"
                  style="height: 100%; top: 0; left: 0; background: #111115 !important; z-index: 10;"
                >
                  <v-card-title class="font-orbitron secondary--text pb-2">
                    {{ $t("User.MapEdit") }}
                  </v-card-title>
                  <v-card-subtitle class="flex-grow-1 pb-0">
                    <v-text-field
                      v-model="mapInfo.map_display_name"
                      :label="$t('User.MapDisplayName')"
                      dense
                      filled
                      class="custom-field mb-2"
                      hide-details
                    />
                    <v-text-field
                      v-model="mapInfo.map_name"
                      :label="$t('User.MapName')"
                      dense
                      filled
                      class="custom-field mb-2"
                      hide-details
                    />
                    <v-checkbox
                      v-model="mapInfo.enabled"
                      :label="$t('User.MapEnabled')"
                      dense
                      hide-details
                    />
                  </v-card-subtitle>
                  <v-card-actions class="d-flex flex-column pa-4 pt-2 mt-auto gap-2">
                    <v-btn
                      depressed
                      block
                      color="secondary"
                      class="neon-btn-small mb-2"
                      @click="
                        UpdateMapInfo(mapInfo);
                        mapInfo.reveal = false;
                      "
                    >
                      {{ $t("User.MapSave") }}
                    </v-btn>
                    <v-btn
                      text
                      block
                      color="grey lighten-1"
                      @click="mapInfo.reveal = false"
                    >
                      {{ $t("misc.Cancel") }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-expand-transition>
            </v-card>
        </v-col>
      </v-row>
    </v-item-group>
    <v-dialog v-model="deleteDialog" max-width="600px">
      <v-card class="glass-card">
        <v-card-title>
          <span class="headline font-orbitron primary--text">
            {{ $t("User.MapDeleteTitle") }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addPlayerForm">
            <v-container>
              <v-row>
                <v-col cols="12" class="white--text">
                  {{
                    $t("User.MapDeleteExplain", {
                      map: selectedMap.map_display_name
                    })
                  }}
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="deleteDialog = false">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="neon-btn-small" @click="DeleteMapInfo(selectedMap)">
            {{ $t("misc.Confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="12" sm="12" md="12" lg="3" class="d-flex">
        <v-card class="glass-card d-flex flex-column overflow-hidden" style="width: 100%; min-height: 280px;">
          <div class="flex-grow-1">
            <v-card-title class="font-orbitron primary--text"> {{ $t("User.MapNew") }} </v-card-title>
          </div>
          <v-card-actions class="pt-0 mt-auto">
              <v-btn
                class="ml-2 mt-3"
                fab
                icon
                height="40px"
                left
                width="40px"
                @click="newMapReveal = true"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-card-actions>
            <v-expand-transition>
              <v-card
                v-if="newMapReveal"
                class="transition-fast-in-fast-out v-card--reveal d-flex flex-column pt-0 glass-card"
                style="height: 100%; top: 0; left: 0; background: #111115 !important; z-index: 10;"
              >
                <v-card-title class="font-orbitron secondary--text pb-2">
                  {{ $t("User.MapNew") }}
                </v-card-title>
                <v-card-subtitle class="flex-grow-1 pb-0">
                  <v-text-field
                    v-model="newMap.map_display_name"
                    :label="$t('User.MapDisplayName')"
                    dense
                    filled
                    class="custom-field mb-2"
                    hide-details
                  />
                  <v-text-field
                    v-model="newMap.map_name"
                    :label="$t('User.MapName')"
                    dense
                    filled
                    class="custom-field mb-2"
                    hide-details
                  />
                  <v-checkbox
                    v-model="newMap.enabled"
                    :label="$t('User.MapEnabled')"
                    dense
                    hide-details
                  />
                </v-card-subtitle>
                <v-card-actions class="d-flex flex-column pa-4 pt-2 mt-auto gap-2">
                  <v-btn
                    depressed
                    block
                    color="primary"
                    class="neon-btn-small mb-2"
                    @click="InsertMapInfo(newMap)"
                  >
                    {{ $t("User.MapSave") }}
                  </v-btn>
                  <v-btn
                    text
                    block
                    color="grey lighten-1"
                    @click="cancelNewMap"
                  >
                    {{ $t("misc.Cancel") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      MapList: [],
      Selected: [],
      deleteDialog: false,
      selectedMap: {},
      newMapReveal: false,
      newMap: {
        map_display_name: "",
        map_name: "",
        enabled: true
      }
    };
  },
  created() {
    this.GetMapInfo();
  },
  methods: {
    async GetMapInfo() {
      try {
        let res = await this.GetUserMapList(this.user.id);
        if (typeof res == "string") res = [];
        else {
          res.forEach(mapInfo => {
            mapInfo.reveal = false;
            this.MapList.push(mapInfo);
          });
        }
      } catch (error) {
        console.log(error);
      }
      return;
    },
    async UpdateMapInfo(mapInfo) {
      try {
        let updateMapData = [
          {
            id: mapInfo.id,
            map_name: mapInfo.map_name,
            map_display_name: mapInfo.map_display_name,
            enabled: mapInfo.enabled
          }
        ];
        await this.UpdateUserMap(updateMapData);
      } catch (error) {
        console.log(error);
      }
    },
    async DeleteMapInfo(mapInfo) {
      try {
        let mapToDelete = [
          {
            id: mapInfo.id
          }
        ];
        await this.DeleteUserMap(mapToDelete);
        this.MapList = this.MapList.filter(
          map => map.id != this.selectedMap.id
        );
        this.selectedMap = {};
        this.deleteDialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    async InsertMapInfo(mapInfo) {
      try {
        let newMap = [
          {
            map_name: mapInfo.map_name,
            map_display_name: mapInfo.map_display_name,
            enabled: mapInfo.enabled
          }
        ];
        await this.InsertUserMapInfo(newMap);
        this.newMapReveal = false;
        this.MapList.push(mapInfo);
        this.newMap = {
          map_display_name: "",
          map_name: "",
          enabled: true
        };
      } catch (error) {
        console.log(error);
      }
    },
    cancelNewMap() {
      this.newMap = {
        map_display_name: "",
        map_name: "",
        enabled: true
      };
      this.newMapReveal = false;
    }
  }
};
</script>

<style>
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
</style>
