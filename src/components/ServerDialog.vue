<template>
  <v-container>
    <v-dialog shake v-model="show" persistent max-width="800px">
      <v-card class="glass-card pa-4 overflow-hidden">
        <v-card-title>
          <span class="font-orbitron primary--text headline title-glow">
            {{ title }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="serverForm">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-alert
                    border="left"
                    colored-border
                    color="secondary"
                    class="glass-panel white--text border-left"
                    icon="mdi-information-outline"
                    v-html="$t('ServerCreate.Get5Help')"
                  >
                  </v-alert>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="serverInfo.display_name"
                    ref="ServerName"
                    :label="$t('ServerCreate.FormDisplayName')"
                    filled
                    class="custom-field"
                    required
                    :rules="[
                      () => !!serverInfo.display_name || $t('misc.Required')
                    ]"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="8">
                  <v-text-field
                    v-model="serverInfo.ip_string"
                    :label="$t('ServerCreate.FormServerIP')"
                    :hint="$t('ServerCreate.FormServerHint')"
                    ref="HostName"
                    filled
                    class="custom-field"
                    required
                    :rules="[
                      () => !!serverInfo.ip_string || $t('misc.Required')
                    ]"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="4">
                  <v-text-field
                    v-model="serverInfo.port"
                    :label="$t('ServerCreate.FormServerPort')"
                    ref="Port"
                    type="number"
                    filled
                    class="custom-field"
                    :rules="[
                      () => !!serverInfo.port || $t('misc.Required'),
                      () =>
                        (serverInfo.port > 0 && serverInfo.port < 65536) ||
                        $t('ServerCreate.PortRangeIncorrect')
                    ]"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="4">
                  <v-text-field
                    v-model.number="serverInfo.gotv_port"
                    :label="$t('ServerCreate.FormGOTVPort')"
                    ref="GotvPort"
                    type="number"
                    filled
                    class="custom-field"
                    :rules="[
                      () =>
                        serverInfo.gotv_port == null ||
                        (serverInfo.gotv_port > 0 &&
                          serverInfo.gotv_port < 65536) ||
                        $t('ServerCreate.PortRangeIncorrect')
                    ]"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="10">
                  <v-text-field
                    v-model="serverInfo.rcon_password"
                    :label="$t('ServerCreate.FormRCONPassword')"
                    :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPass ? 'text' : 'password'"
                    name="rcon_password"
                    ref="password"
                    filled
                    class="custom-field"
                    @click:append="showPass = !showPass"
                  />
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="2" class="d-flex align-center">
                  <v-switch
                    v-model="serverInfo.public_server"
                    :label="$t('ServerCreate.FormPublicServer')"
                    color="primary"
                    inset
                    ref="public_server"
                  />
                </v-col>
                <v-col cols="12" sm="8" md="10" lg="10">
                  <v-select
                    :items="flags"
                    v-model="serverInfo.flag"
                    :label="$t('MyServers.Flag')"
                    filled
                    class="custom-field"
                  />
                </v-col>
                <v-col cols="12" sm="4" md="2" lg="2" class="d-flex align-center justify-center">
                  <img
                    :src="get_flag_link(serverInfo)"
                    style="border-radius: 5px; max-height: 48px; box-shadow: 0 0 10px rgba(0,0,0,0.5);"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey lighten-1"
            text
            @click.stop="show = false"
            :disabled="serverLoading"
            class="font-weight-black"
          >
            {{ $t("misc.Cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="saveServer()"
            :loading="serverLoading"
            :disabled="serverLoading"
            class="black--text font-weight-black px-8 rounded-lg"
          >
            {{ $t("misc.Save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  </v-container>
</template>

<script>
export default {
  props: {
    value: Boolean,
    serverInfo: Object,
    title: String
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        if (!value) {
          this.$nextTick(() => {
            this.$refs.serverForm.resetValidation();
          });
        }
        this.$emit("input", value);
      }
    }
  },
  data() {
    return {
      showPass: false,
      response: "",
      responseSheet: false,
      serverLoading: false,
      flags: []
    };
  },
  created() {
    this.flags = this.GetFlags();
  },
  methods: {
    async saveServer() {
      let refreshGrid = true;
      if (this.$refs.serverForm.validate()) {
        this.serverLoading = true;
        let serverRes;
        let serverObj = [
          {
            ip_string: this.serverInfo.ip_string,
            port: this.serverInfo.port,
            display_name: this.serverInfo.display_name,
            rcon_password: this.serverInfo.rcon_password,
            public_server:
              this.serverInfo.public_server == null
                ? false
                : this.serverInfo.public_server,
            flag: this.serverInfo.flag,
            gotv_port: this.serverInfo.gotv_port
          }
        ];
        if (this.serverInfo.id == null)
          serverRes = await this.InsertServer(serverObj);
        else {
          serverObj[0].server_id = this.serverInfo.id;
          serverRes = await this.UpdateServer(serverObj);
        }
        if (serverRes.includes("inserted"))
          this.response = this.$t("ServerCreate.MessageRegisterSuccess");
        else if (serverRes.includes("updated")) {
          this.response = this.$t("ServerCreate.MessageeEditSuccess");
          refreshGrid = false;
        } else this.response = serverRes;
        this.$emit("is-new-server", refreshGrid);
        this.responseSheet = true;
        this.show = false;
        this.serverLoading = false;
      }
    }
  }
};
</script>
