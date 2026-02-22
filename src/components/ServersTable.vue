<template>
  <v-container fluid class="pa-0">
    <v-data-table
      item-key="id"
      class="glass-table custom-table rounded-lg"
      :loading="isLoading"
      :loading-text="$t('misc.LoadText')"
      :headers="selectedHeaders"
      :items="servers"
      :sort-by="['id']"
      ref="ServersTable"
      :items-per-page="10"
    >
      <template v-slot:top>
        <div class="d-flex align-center px-4 py-2 border-bottom">
          <v-spacer />
          <v-btn
            depressed
            color="secondary"
            class="mr-2 white--text font-weight-black rounded-lg"
            @click="allServers = !allServers"
            v-if="user.id != null && user.id != -1"
            small
          >
            <v-icon left size="18">{{ allServers ? 'mdi-account-check' : 'mdi-earth' }}</v-icon>
            {{ allServers ? $t("MyServers.ShowMyServers") : $t("MyServers.ShowPublicServers") }}
          </v-btn>
          <v-btn
            depressed
            color="primary"
            class="black--text font-weight-black neon-btn rounded-lg"
            @click="newDialog = true"
            v-if="user.id != null && user.id != -1"
            small
          >
            <v-icon left size="18">mdi-plus</v-icon>
            {{ $t("MyServers.New") }}
          </v-btn>
        </div>
      </template>
      <template v-slot:item.rcon_password="{ item }">
        <v-text-field
          v-model="item.rcon_password"
          :append-icon="item.showRcon ? 'mdi-eye' : 'mdi-eye-off'"
          :type="item.showRcon ? 'text' : 'password'"
          readonly
          @click:append="item.showRcon = !item.showRcon"
          v-if="item.rcon_password != null"
          filled
          dense
          hide-details
          class="custom-field my-1"
        />
      </template>
      <template v-slot:item.name="{ item }">
        <router-link :to="{ path: '/user/' + item.user_id }" class="secondary--text font-weight-bold hover-link">
          {{ item.name }}
        </router-link>
      </template>
      <template v-slot:item.public_server="{ item }">
        <v-icon v-if="item.public_server == 1" color="green accent-3">
          mdi-check-circle
        </v-icon>
        <v-icon v-else color="cyber-pink">
          mdi-close-circle
        </v-icon>
      </template>
      <template v-slot:item.status="{ item }">
        <v-btn
          small
          depressed
          @click="checkStatus(item)"
          :color="item.colour"
          class="font-weight-black rounded-lg"
          :loading="item.isLoading"
          :disabled="item.isLoading"
          v-if="
            user.id != null && user.id != -1 && (IsAnyAdmin(user) || item.user_id == user.id)
          "
        >
          <v-icon left small>mdi-heart-pulse</v-icon>
          {{ $t("MyServers.Status") }}
        </v-btn>
      </template>
      <template v-slot:item.actions="{ item }">
        <div
          v-if="
            user.id != null && user.id != -1 && (IsAnyAdmin(user) || item.user_id == user.id)
          "
          class="d-flex"
        >
          <v-btn icon small @click="editSelectedServer(item)" class="mr-2">
            <v-icon color="primary" small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteSelectedServer(item)">
            <v-icon color="cyber-pink" small>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
      <template v-slot:item.flag="{ item }">
        <img :src="get_flag_link(item)" style="border-radius: 4px; box-shadow: 0 0 5px rgba(0,0,0,0.5);" />
      </template>
    </v-data-table>
    <v-bottom-sheet v-model="responseSheet" inset persistent>
      <v-sheet class="text-center glass-card pa-8 border-top" height="200px">
        <div class="white--text title mb-6">
          {{ response }}
        </div>
        <v-btn
          depressed
          color="primary"
          class="black--text font-weight-black px-8 rounded-lg"
          @click="
            responseSheet = !responseSheet;
            response = '';
          "
        >
          {{ $t("misc.Close") }}
        </v-btn>
      </v-sheet>
    </v-bottom-sheet>
    <v-dialog v-model="deleteDialog" persistent max-width="600px">
      <v-card class="glass-card pa-4 border-glow">
        <v-card-title>
          <span class="font-orbitron cyber-pink--text headline title-glow">
            {{ $t("MyServers.DeleteConfirmation") }}
          </span>
        </v-card-title>
        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text @click="deleteDialog = false" class="font-weight-black">
            {{ $t("misc.No") }}
          </v-btn>
          <v-btn color="cyber-pink" depressed class="black--text font-weight-black px-6 rounded-lg" @click="deleteServerConfirm()">
            {{ $t("misc.Yes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ServerDialog
      v-model="newDialog"
      :serverInfo="newServer"
      :title="formTitle"
      @is-new-server="GetServers"
    />
  </v-container>
</template>

<script>
import ServerDialog from "./ServerDialog";
export default {
  props: {
    user: Object
  },
  name: "ServersTable",
  components: {
    ServerDialog
  },
  data() {
    return {
      //selectedHeaders: [],
      servers: [],
      isLoading: true,
      deleteDialog: false,
      response: "",
      responseSheet: false,
      removeIndex: -1,
      removeServer: {},
      newDialog: false,
      newServer: {
        display_name: "",
        ip_string: "",
        port: 0,
        rcon_password: "",
        public_server: 0,
        flag: "",
        gotv_port: 0
      },
      allServers: false,
      formTitle: this.$t("MyServers.FormTitleNew")
    };
  },
  created() {
    this.GetServers();
  },
  watch: {
    newDialog(val) {
      if (!val) {
        this.formTitle = this.$t("MyServers.FormTitleNew");
        this.newServer = {};
      }
    },
    allServers() {
      this.GetServers(true);
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t("MyServers.ID"),
          align: "start",
          sortable: true,
          value: "id"
        },
        {
          text: this.$t("MyServers.Name"),
          value: "display_name"
        },
        {
          text: this.$t("MyServers.Host"),
          value: "ip_string"
        },
        {
          text: this.$t("MyServers.Port"),
          value: "port"
        },
        {
          text: this.$t("MyServers.RCONPass"),
          value: "rcon_password"
        },
        {
          text: this.$t("ServerCreate.FormGOTVPort"),
          value: "gotv_port"
        },
        {
          text: this.$t("MyServers.IsPublic"),
          value: "public_server"
        },
        {
          text: this.$t("MyServers.Owner"),
          value: "name"
        },
        {
          text: this.$t("MyServers.Flag"),
          value: "flag"
        },
        {
          text: "",
          value: "actions",
          sortable: false
        },
        {
          text: "",
          value: "status",
          sortable: false
        }
      ];
    },
    selectedHeaders() {
      let tmpHeaders = JSON.parse(JSON.stringify(this.headers));
      let arrIndex;
      if (this.servers.length > 0 && this.servers[0].rcon_password == null) {
        arrIndex = tmpHeaders
          .map(obj => {
            return obj.value;
          })
          .indexOf("rcon_password");
        tmpHeaders.splice(arrIndex, 1);
      }
      if (this.servers.length > 0 && this.servers[0].ip_string == null) {
        arrIndex = tmpHeaders
          .map(obj => {
            return obj.value;
          })
          .indexOf("ip_string");
        tmpHeaders.splice(arrIndex, 1);
      }
      if (this.servers.length > 0 && this.servers[0].port == null) {
        arrIndex = tmpHeaders
          .map(obj => {
            return obj.value;
          })
          .indexOf("port");
        tmpHeaders.splice(arrIndex, 1);
      }
      if (this.servers.length > 0 && this.servers[0].gotv_port == null) {
        arrIndex = tmpHeaders
          .map(obj => {
            return obj.value;
          })
          .indexOf("gotv_port");
        tmpHeaders.splice(arrIndex, 1);
      }
      return tmpHeaders;
    }
  },
  methods: {
    async GetServers(refreshGrid) {
      if (refreshGrid === false) return;
      try {
        let res;
        this.servers = [];
        this.isLoading = true;
        if (this.$route.path == "/myservers" && this.allServers === false)
          res = await this.GetMyServers();
        else {
          res = await this.GetAllServers();
        }
        if (typeof res == "string") res = [];
        res.forEach(async season => {
          season.showRcon = false;
          season.colour = "gray";
          season.isLoading = false;
          this.servers.push(season);
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
      return;
    },
    deleteSelectedServer(item) {
      if (item != null) {
        this.removeIndex = this.servers.indexOf(item);
        this.removeServer = Object.assign({}, item);
      }
      this.deleteDialog = true;
    },
    async deleteServerConfirm() {
      let serverData = [
        {
          server_id: this.removeServer.id
        }
      ];
      this.response = await this.DeleteServer(serverData);
      this.servers.splice(this.removeIndex, 1);
      this.closeDelete();
    },
    closeDelete() {
      this.deleteDialog = false;
      this.responseSheet = true;
      this.$nextTick(() => {
        this.removeServer = {};
        this.removeIndex = -1;
      });
    },
    async editSelectedServer(item) {
      this.formTitle = this.$t("MyServers.FormTitleEdit");
      this.newServer = item;
      this.newDialog = true;
      return;
    },
    async checkStatus(server) {
      try {
        let response;
        server.isLoading = true;
        response = await this.GetServerStatus(server.id);
        if (response.includes("alive")) server.colour = "green";
        else server.colour = "red";
      } catch {
        server.colour = "red";
      } finally {
        server.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.neon-btn {
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

.neon-btn:hover {
  box-shadow: 0 0 25px rgba(0, 242, 255, 0.5);
  transform: translateY(-2px);
}
</style>
