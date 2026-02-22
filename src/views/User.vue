<template>
  <v-container class="px-4 py-8">
    <v-card class="glass-card mb-8 profile-header overflow-hidden">
      <v-container class="pa-8">
        <v-row align="center">
          <v-col cols="auto">
            <v-avatar size="100" class="neon-border">
              <v-img :src="retrievedUser.large_image || retrievedUser.medium_image" />
            </v-avatar>
          </v-col>
          <v-col>
            <div class="d-flex align-center mb-2">
              <h1 class="font-orbitron primary--text mr-4 mb-0">{{ retrievedUser.name }}</h1>
              <a
                v-if="retrievedUser.steam_id != 0"
                :href="`https://steamcommunity.com/profiles/${retrievedUser.steam_id}`"
                target="_blank"
                class="steam-link"
              >
                <v-icon color="grey lighten-1">mdi-steam</v-icon>
              </a>
            </div>
            <div class="chips-container">
              <v-chip
                v-if="retrievedUser.super_admin === 1"
                color="primary"
                small
                label
                class="font-weight-bold mr-2"
                outlined
              >
                {{ $t("User.SuperAdmin") }}
              </v-chip>
              <v-chip
                v-if="retrievedUser.admin === 1"
                color="secondary"
                small
                label
                class="font-weight-bold"
                outlined
              >
                {{ $t("User.Admin") }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <!-- API Settings - Only for self -->
    <v-card v-if="retrievedUser.api_key != undefined" class="glass-card mb-8 pa-6">
      <h2 class="font-orbitron primary--text headline mb-6">
        <v-icon left color="primary">mdi-key-variant</v-icon>
        {{ $t("User.API") }}
      </h2>
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="retrievedUser.api_key"
            label="G5API Key"
            :append-icon="showAPI ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showAPI ? 'text' : 'password'"
            readonly
            filled
            class="custom-field"
            @click:append="showAPI = !showAPI"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn
            block
            depressed
            color="secondary"
            :loading="apiResetLoading"
            @click="resetApiKey"
          >
            {{ $t("User.ResetAPI") }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="retrievedUser.challonge_api_key"
            label="Challonge API Key"
            :append-icon="showChallongeAPI ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showChallongeAPI ? 'text' : 'password'"
            filled
            class="custom-field mb-0"
            @click:append="showChallongeAPI = !showChallongeAPI"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn
            block
            depressed
            color="secondary"
            :loading="challongeApiResetLoading"
            @click="saveChallongeApiKey"
          >
            {{ $t("misc.Save") }}
          </v-btn>
        </v-col>
      </v-row>
      <v-divider class="my-6"></v-divider>
      <v-row v-if="retrievedUser.id == user.id">
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <div>
            <div class="subtitle-1 font-orbitron font-weight-bold white--text">Account Security</div>
            <div class="text-caption grey--text">Update your login password for G5V.</div>
          </div>
          <v-btn
            depressed
            color="primary"
            class="neon-btn-small"
            @click="passwordResetDialog = true"
          >
            <v-icon left>mdi-lock-reset</v-icon>
            {{ $t("User.ResetPass") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Stats & History -->
    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="glass-card mb-8 pa-6">
          <h2 class="font-orbitron primary--text headline mb-6">
             <v-icon left color="primary">mdi-sword-cross</v-icon>
             {{ $t("User.Past5") }}
          </h2>
          <MatchesTable v-if="retrievedUser.steam_id != ''" :user="retrievedUser" />
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <v-card class="glass-card mb-8 pa-6">
          <h2 class="font-orbitron secondary--text headline mb-6">
            <v-icon left color="secondary">mdi-chart-areaspline</v-icon>
            {{ $t("User.Stats") }}
          </h2>
          <PlayerStats v-if="userStats != null" :statArray="userStats" />
        </v-card>
      </v-col>
    </v-row>

    <!-- Map List -->
    <v-card v-if="retrievedUser.id == user.id || IsAnyAdmin(user)" class="glass-card pa-6">
      <h2 class="font-orbitron primary--text headline mb-6">
        <v-icon left color="primary">mdi-map-plus</v-icon>
        {{ $t("User.UserMaps", { players: retrievedUser.name }) }}
      </h2>
      <MapList v-if="retrievedUser.id > 0" :user="retrievedUser" />
    </v-card>

    <PasswordResetDialog
      v-model="passwordResetDialog"
      :title="$t('User.ResetPass')"
    />
  </v-container>
</template>
<script>
import MatchesTable from "@/components/MatchesTableNoLimits";
import PlayerStats from "@/components/PlayerStatInfo";
import MapList from "@/components/NewMap";
import PasswordResetDialog from "@/components/PasswordResetDialog";

export default {
  name: "User",
  components: {
    MatchesTable,
    PlayerStats,
    MapList,
    PasswordResetDialog
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
      },
      retrievedUser: {
        admin: false,
        steam_id: "",
        id: -1,
        super_admin: false,
        name: "",
        small_image: "",
        medium_image: "",
        large_image: ""
      }, // should be object from JSON response
      userStats: [],
      showAPI: false,
      showChallongeAPI: false,
      apiResetLoading: false,
      showPass: false,
      passwordResetDialog: false,
      challongeApiResetLoading: false
    };
  },
  async created() {
    this.user = await this.IsLoggedIn();
    if (this.$route.params.id == undefined) this.retrievedUser = this.user;
    else this.retrievedUser = await this.GetUserData(this.$route.params.id);

    if (this.retrievedUser.id === 0) {
      this.userStats = await this.GetUserPlayerStats(this.$route.params.id);
      this.retrievedUser.name = this.userStats[0].name;
      this.retrievedUser.steam_id = this.userStats[0].steam_id;
    } else
      this.userStats = await this.GetUserPlayerStats(
        this.retrievedUser.steam_id
      );
    if (typeof this.userStats == "string") this.userStats = [];
  },
  methods: {
    async resetApiKey() {
      this.apiResetLoading = true;
      let renewKey = [
        {
          steam_id: this.retrievedUser.steam_id,
          new_api: 1
        }
      ];
      await this.UpdateUserInfo(renewKey);
      this.retrievedUser = await this.GetUserData(this.retrievedUser.id);
      this.apiResetLoading = false;
    },
    async saveChallongeApiKey() {
      this.challongeApiResetLoading = true;
      let updateData = [
        {
          steam_id: this.retrievedUser.steam_id,
          id: this.retrievedUser.id,
          challonge_api_key: this.retrievedUser.challonge_api_key
        }
      ];
      await this.UpdateUserInfo(updateData);
      this.retrievedUser = await this.GetUserData(this.retrievedUser.id);
      this.challongeApiResetLoading = false;
    }
  }
};
</script>

<style scoped>
.font-orbitron {
  font-family: "Orbitron", sans-serif !important;
  letter-spacing: 2px;
}

.neon-border {
  border: 3px solid var(--neon-cyan) !important;
  box-shadow: 0 0 15px var(--neon-cyan);
}

.profile-header {
  border-left: 6px solid var(--neon-cyan) !important;
}

.steam-link {
  text-decoration: none;
  transition: all 0.2s ease;
}

.steam-link:hover .v-icon {
  color: var(--neon-cyan) !important;
  transform: scale(1.2);
}

.custom-field ::v-deep .v-input__slot {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px !important;
}

.headline {
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
