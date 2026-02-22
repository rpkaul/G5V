<template>
  <v-container class="admin-button pa-0" fluid>
    <template v-if="layout === 'menu'">
      <v-menu bottom offset-y open-on-hover>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="primary darken-1"
            v-bind="attrs"
            v-on="on"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ $t("MatchAdmin.AdminTools") }}
          </v-btn>
        </template>
        <v-list v-if="user.super_admin == 1">
          <v-list-item
            v-for="(item, i) in superAdminItems"
            :key="i"
            @click="item.apiCall()"
          >
            <v-list-item-icon v-if="item.icon"><v-icon color="primary">{{ item.icon }}</v-icon></v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            @click="item.apiCall()"
          >
            <v-list-item-icon v-if="item.icon"><v-icon color="primary">{{ item.icon }}</v-icon></v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-else-if="layout === 'tiles'">
      <div class="control-grid">
        <v-btn
          v-for="btn in dashboardActions"
          :key="btn.title"
          :color="btn.color"
          class="action-tile flex-grow-1 mb-4 mx-2"
          @click="btn.apiCall()"
          :loading="isLoading"
          :disabled="isLoading"
          height="80"
          width="140"
        >
          <div class="d-flex flex-column align-center">
            <v-icon size="28" class="mb-1">{{ btn.icon }}</v-icon>
            <span class="text-caption font-weight-black text-uppercase">{{ btn.title }}</span>
          </div>
        </v-btn>
        
        <!-- More Tools for Tiles Mode -->
        <v-menu offset-y top transition="slide-y-transition" v-if="superAdminItems.length > 5">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              text
              color="primary"
              class="font-weight-bold mx-2"
              height="80"
            >
              <v-icon left>mdi-dots-vertical</v-icon>
              {{ $t("MatchAdmin.AdminTools") }}
            </v-btn>
          </template>
          <v-list class="glass-card">
            <v-list-item v-for="(item, i) in superAdminItems.slice(5)" :key="i" @click="item.apiCall()">
              <v-list-item-icon v-if="item.icon"><v-icon color="primary">{{ item.icon }}</v-icon></v-list-item-icon>
              <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>

    <v-bottom-sheet v-model="responseSheet" inset persistent>
      <v-sheet class="text-center glass-card" height="200px">
        <v-btn
          class="mt-6"
          text
          color="success"
          @click="
            responseSheet = !responseSheet;
            response = '';
            $emit('force-the-reload', true);
          "
        >
          close
        </v-btn>
        <div class="my-3 white--text headline">
          {{ response }}
        </div>
      </v-sheet>
    </v-bottom-sheet>
    <v-dialog v-model="cancelDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron cyber-pink--text headline title-glow">
            {{ $t("MatchAdmin.CancelMatchConfirm") }}
          </span>
        </v-card-title>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="cancelDialog = false" class="font-weight-bold">
            {{ $t("misc.No") }}
          </v-btn>
          <v-btn color="cyber-pink" depressed class="black--text font-weight-black px-6 rounded-lg" @click="cancelCurrentMatch()">
            {{ $t("misc.Yes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="restartDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ $t("MatchAdmin.MatchRestartInfo") }}
          </span>
        </v-card-title>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            :disabled="isLoading"
            color="grey lighten-1"
            text
            @click="restartDialog = false"
            class="font-weight-bold"
          >
            {{ $t("misc.No") }}
          </v-btn>
          <v-btn
            :disabled="isLoading"
            color="primary"
            depressed
            class="black--text font-weight-black px-6 rounded-lg"
            @click="sendRestartMatch()"
          >
            {{ $t("misc.Yes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            Add Player to {{ matchInfo.team1_name }} / {{ matchInfo.team2_name }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addPlayerForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    :label="$t('MatchAdmin.SteamLabel')"
                    :hint="$t('MatchAdmin.SteamHint')"
                    placeholder="7656..."
                    ref="steamID"
                    v-model="steamID"
                    required
                    :rules="[
                      () => !!steamID || $t('MatchAdmin.SteamRuleRequired')
                    ]"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Nickname"
                    ref="nickname"
                    :hint="$t('MatchAdmin.SteamNicknameHint')"
                    v-model="nickname"
                    :rules="[
                      () =>
                        nickname.length <= 40 || $t('MatchAdmin.SteamNickRule')
                    ]"
                    counter="40"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-btn color="grey lighten-1" text @click="addDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="secondary" depressed class="black--text font-weight-black px-4 rounded-lg" @click="addPlayerToServer('spec')">
            {{ $t("MatchAdmin.AddToSpec") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-4 rounded-lg" @click="addPlayerToServer('team1')">
            Add to {{ matchInfo.team1_name }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            class="black--text font-weight-black px-4 rounded-lg"
            @click="addPlayerToServer('team2')"
          >
            Add to {{ matchInfo.team2_name }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="forfeitDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron cyber-pink--text headline title-glow">
            {{ $t("MatchAdmin.ForfeitConfirm") }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                {{ $t("MatchAdmin.ForfeitChoice") }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey lighten-1"
            text
            @click="forfeitDialog = false"
            :disabled="isLoading"
            :loading="isLoading"
            class="font-weight-bold"
          >
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="forfeitCurrentMatch(1)"
            :disabled="isLoading"
            :loading="isLoading"
            class="black--text font-weight-black px-6 rounded-lg"
          >
            Winner: {{ matchInfo.team1_name }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="forfeitCurrentMatch(2)"
            :disabled="isLoading"
            :loading="isLoading"
            class="black--text font-weight-black px-6 rounded-lg"
          >
            Winner: {{ matchInfo.team2_name }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="rconDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ $t("MatchAdmin.RCONDialog") }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="rconForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    :label="$t('MatchAdmin.RCONCommand')"
                    :hint="$t('MatchAdmin.RCONHint')"
                    placeholder="status"
                    ref="rconCommand"
                    v-model="rconCommand"
                    required
                    :rules="[() => !!rconCommand || $t('misc.Required')]"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="rconDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-6 rounded-lg" @click="sendRconCommand()">
            {{ $t("MatchAdmin.SendRCON") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="backupDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ $t("MatchAdmin.LoadBackupFile") }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="backupForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="selectedBackup"
                    :items="backups"
                    :rules="[v => !!v || $t('misc.Required')]"
                    :label="$t('MatchAdmin.Backup')"
                    required
                    ref="currentBackup"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="backupDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-6 rounded-lg" @click="sendBackupRestore()">
            {{ $t("MatchAdmin.Restore") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog shake v-model="serverChangeDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ $t("MatchAdmin.ChangeServer") }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="serverForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card-text class="font-weight-bold">
                    {{ $t("MatchAdmin.ServerChangeNote") }}
                  </v-card-text>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="selectedServer"
                    :items="servers"
                    item-text="display_name"
                    item-value="id"
                    :rules="[v => !!v || $t('misc.Required')]"
                    :label="$t('CreateMatch.ServerLabel')"
                    required
                    ref="newServer"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="selectedBackup"
                    :items="backups"
                    :rules="[v => !!v || $t('misc.Required')]"
                    :label="$t('MatchAdmin.Backup')"
                    required
                    ref="currentBackup"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="serverChangeDialog = false" class="font-weight-bold">
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn color="primary" depressed class="black--text font-weight-black px-6 rounded-lg" @click="sendServerChange()">
            {{ $t("misc.Change") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  props: {
    matchInfo: Object,
    user: Object,
    layout: {
      type: String,
      default: "menu" // menu or tiles
    }
  },
  data() {
    return {
      response: "",
      responseSheet: false,
      cancelDialog: false,
      addDialog: false,
      restartDialog: false,
      forfeitDialog: false,
      rconDialog: false,
      backupDialog: false,
      serverChangeDialog: false,
      rconCommand: "",
      steamID: "",
      nickname: "",
      backups: [],
      selectedBackup: "",
      selectedServer: "",
      servers: [],
      isLoading: false
    };
  },

  watch: {
    addDialog() {
      this.$nextTick(() => {
        this.steamID = "";
        this.nickname = "";
        this.$refs.addPlayerForm.resetValidation();
      });
    },
    rconDialog() {
      this.$nextTick(() => {
        this.rconCommand = "";
        this.$refs.rconForm.resetValidation();
      });
    },
    backupDialog() {
      this.$nextTick(() => {
        this.selectedBackup = "";
        this.$refs.backupForm.resetValidation();
      });
    },
    serverChangeDialog() {
      this.$nextTick(() => {
        this.selectedServer = "";
        this.$refs.serverForm.resetValidation();
      });
    }
  },
  computed: {
    items() {
      return [
        {
          title: this.$t("MatchAdmin.PauseMatch"),
          icon: "mdi-pause",
          color: "warning",
          apiCall: async () => {
            this.isLoading = true;
            this.response = await this.PauseMatch(this.matchInfo.id);
            this.responseSheet = true;
            this.isLoading = false;
          }
        },
        {
          title: this.$t("MatchAdmin.UnpauseMatch"),
          icon: "mdi-play",
          color: "success",
          apiCall: async () => {
            this.isLoading = true;
            this.response = await this.UnpauseMatch(this.matchInfo.id);
            this.isLoading = false;
            this.responseSheet = true;
          }
        },
        {
          title: this.$t("MatchAdmin.MatchRestart"),
          icon: "mdi-refresh",
          color: "info",
          apiCall: () => {
            this.restartDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.AddPlayerToServer"),
          icon: "mdi-account-plus",
          apiCall: () => {
            this.addDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ListBackups"),
          icon: "mdi-history",
          apiCall: async () => {
            let res = await this.GetMatchBackups(this.matchInfo.id);
            if (res.response) {
              this.backups = res.response.split("\n");
              this.backupDialog = true;
            } else {
              this.response = res.message;
              this.responseSheet = true;
            }
          }
        },
        {
          title: this.$t("MatchAdmin.CancelMatch"),
          icon: "mdi-cancel",
          color: "error",
          apiCall: () => {
            this.cancelDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ForfeitMatch"),
          icon: "mdi-flag-variant",
          color: "error",
          apiCall: () => {
            this.forfeitDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ChangeServer"),
          icon: "mdi-server-network",
          apiCall: async () => {
            try {
              let res = await this.GetAllAvailableServers();
              if (Array.isArray(res)) {
                res.sort((a, b) => {
                  return (
                    a.user_id - this.user.id ||
                    b.public_server - a.public_server
                  );
                });
                this.servers = res;
                res = await this.GetRemoteBackups(this.matchInfo.id);
                if (res.response) this.backups = res.response;
              } else {
                this.response = res.message;
                this.responseSheet = true;
              }
            } finally {
              this.serverChangeDialog = true;
            }
          }
        }
      ];
    },
    superAdminItems() {
      return [
        {
          title: this.$t("MatchAdmin.PauseMatch"),
          icon: "mdi-pause",
          color: "warning",
          apiCall: async () => {
            this.isLoading = true;
            this.response = await this.PauseMatch(this.matchInfo.id);
            this.responseSheet = true;
            this.isLoading = false;
          }
        },
        {
          title: this.$t("MatchAdmin.UnpauseMatch"),
          icon: "mdi-play",
          color: "success",
          apiCall: async () => {
            this.isLoading = true;
            this.response = await this.UnpauseMatch(this.matchInfo.id);
            this.isLoading = false;
            this.responseSheet = true;
          }
        },
        {
          title: this.$t("MatchAdmin.MatchRestart"),
          icon: "mdi-refresh",
          color: "info",
          apiCall: () => {
            this.restartDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.SendRCON"),
          icon: "mdi-console",
          apiCall: () => {
            this.rconDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.AddPlayerToServer"),
          icon: "mdi-account-plus",
          apiCall: () => {
            this.addDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ListBackups"),
          icon: "mdi-history",
          apiCall: async () => {
            let res = await this.GetMatchBackups(this.matchInfo.id);
            if (res.response) {
              this.backups = res.response.split("\n");
              this.backupDialog = true;
            } else {
              this.response = res.message;
              this.responseSheet = true;
            }
          }
        },
        {
          title: this.$t("MatchAdmin.CancelMatch"),
          icon: "mdi-cancel",
          color: "error",
          apiCall: () => {
            this.cancelDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ForfeitMatch"),
          icon: "mdi-flag-variant",
          color: "error",
          apiCall: () => {
            this.forfeitDialog = true;
          }
        },
        {
          title: this.$t("MatchAdmin.ChangeServer"),
          icon: "mdi-server-network",
          apiCall: async () => {
            try {
              let res = await this.GetAllAvailableServers();
              if (Array.isArray(res)) {
                res.sort((a, b) => {
                  return (
                    a.user_id - this.user.id ||
                    b.public_server - a.public_server
                  );
                });
                this.servers = res;
                res = await this.GetRemoteBackups(this.matchInfo.id);
                if (res.response) this.backups = res.response;
              } else {
                this.response = res.message;
                this.responseSheet = true;
              }
            } finally {
              this.serverChangeDialog = true;
            }
          }
        }
      ];
    },
    dashboardActions() {
      // Pick top 4 or 5 actions for the dashboard tiles
      if (this.user.super_admin == 1) {
        return this.superAdminItems.slice(0, 5);
      }
      return this.items.slice(0, 5);
    }
  },
  methods: {
    async cancelCurrentMatch() {
      this.isLoading = true;
      let matchRes = await this.CancelMatch(this.matchInfo.id);
      this.response = matchRes;
      this.cancelDialog = false;
      this.isLoading = false;
      this.responseSheet = true;
      return;
    },
    async addPlayerToServer(teamChoice) {
      if (this.$refs.addPlayerForm.validate()) {
        this.isLoading = true;
        let addRes;
        let matchObject = [
          {
            steam_id: this.steamID,
            nickname: this.nickname,
            team_id: teamChoice
          }
        ];
        if (teamChoice == "spec") {
          addRes = await this.AddUserToSpectator(
            this.matchInfo.id,
            matchObject
          );
          this.response =
            addRes.response == null ? addRes.message : addRes.response;
        } else {
          addRes = await this.AddUserToTeam(this.matchInfo.id, matchObject);
          this.response =
            addRes.response == null ? addRes.message : addRes.response;
        }
        this.addDialog = false;
        this.isLoading = false;
        this.responseSheet = true;
      }
    },
    async forfeitCurrentMatch(team) {
      this.isLoading = true;
      let matchRes = await this.ForfeitMatch(this.matchInfo.id, team);
      this.response = matchRes;
      this.forfeitDialog = false;
      this.responseSheet = true;
      this.isLoading = false;
      return;
    },
    async sendRconCommand() {
      if (this.$refs.rconForm.validate()) {
        this.isLoading = true;
        let addRes;
        let matchObject = [
          {
            rcon_command: this.rconCommand
          }
        ];
        addRes = await this.SendRconCommandToMatch(
          this.matchInfo.id,
          matchObject
        );
        this.response =
          addRes.response == null ? addRes.message : addRes.response;
        this.rconDialog = false;
        this.isLoading = false;
        this.responseSheet = true;
      }
    },
    async sendBackupRestore() {
      if (this.$refs.backupForm.validate()) {
        this.isLoading = true;
        let backupRes;
        let backupObject = [
          {
            backup_name: this.selectedBackup
          }
        ];
        backupRes = await this.RestoreFromBackup(
          this.matchInfo.id,
          backupObject
        );
        this.response =
          backupRes.response == null ? backupRes.message : backupRes.response;
        this.backupDialog = false;
        this.isLoading = false;
        this.responseSheet = true;
      }
    },
    async sendServerChange() {
      if (this.$refs.serverForm.validate()) {
        this.isLoading = true;
        let serverRes;
        let matchObject = [
          {
            match_id: this.matchInfo.id,
            server_id: this.selectedServer
          }
        ];
        let backupObject = [
          {
            server_id: this.selectedServer,
            backup_file: this.selectedBackup
          }
        ];
        serverRes = await this.UpdateMatchInfo(matchObject);
        this.response =
          serverRes.response == null ? serverRes.message : serverRes.response;
        this.serverChangeDialog = false;
        serverRes = await this.RestoreFromRemoteBackup(
          this.matchInfo.id,
          backupObject
        );
        this.response +=
          serverRes.response == null ? serverRes.message : serverRes.response;
        this.isLoading = false;
        this.responseSheet = true;
      }
    },
    async sendRestartMatch() {
      this.isLoading = true;
      let matchRes = await this.RestartCurrentMatch(this.matchInfo.id);
      this.response = matchRes;
      this.restartDialog = false;
      this.responseSheet = true;
      this.isLoading = false;
      return;
    }
  }
};
</script>

<style scoped>
.control-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.action-tile {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
}

.action-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4) !important;
  filter: brightness(1.2);
}

.glass-card {
  background: rgba(22, 22, 26, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>
