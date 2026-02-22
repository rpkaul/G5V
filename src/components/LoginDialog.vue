<template>
  <v-container style="padding: 0px">
    <v-dialog shake v-model="show" max-width="500px">
      <v-card class="glass-card overflow-hidden">
        <v-card-title class="pa-6">
          <span class="font-orbitron primary--text headline">
            {{ title }}
          </span>
          <v-spacer></v-spacer>
          <v-btn icon small @click="show = false" color="grey">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0">
          <v-form ref="loginForm">
            <v-alert
              type="info"
              outlined
              class="glass-card mb-6"
              v-html="$t('Login.Info')"
            >
            </v-alert>

            <v-text-field
              v-model="userInfo.steam_id"
              ref="SteamId"
              :label="$t('Login.SteamIdLabel')"
              filled
              dense
              class="mb-2"
            />
            
            <v-text-field
              v-model="userInfo.username"
              :label="$t('Login.UsernameLabel')"
              ref="Username"
              required
              filled
              dense
              class="mb-2"
              :rules="[() => !!userInfo.username || $t('misc.Required')]"
            />
            
            <v-text-field
              v-model="userInfo.password"
              :label="$t('Login.PasswordLabel')"
              ref="Password"
              :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPass ? 'text' : 'password'"
              filled
              dense
              :rules="[() => !!userInfo.password || $t('misc.Required')]"
              @click:append="showPass = !showPass"
              @keyup.enter="userLogin()"
            />
          </v-form>

          <v-divider class="my-6 opacity-20" />
          
          <div class="text-center">
            <div class="grey--text text-uppercase caption font-weight-bold mb-4 letter-spacing-1">
              OR SIGN IN WITH
            </div>
            <a :href="apiUrl + '/auth/steam'" class="steam-login-btn">
              <img src="/img/login_noborder.png" alt="Sign in through Steam" />
            </a>
          </div>
        </v-card-text>

        <v-divider class="mx-6 opacity-20" />

        <v-card-actions class="pa-6">
          <v-btn
            color="secondary"
            outlined
            @click="userRegister"
            :disabled="userLoading"
            class="px-6"
          >
            {{ $t("Login.Register") }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            depressed
            class="black--text px-8"
            @click="userLogin()"
            :loading="userLoading"
            :disabled="userLoading"
          >
            {{ $t("Login.Login") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-bottom-sheet v-model="responseSheet" inset persistent>
      <v-sheet class="text-center" height="200px">
        <v-btn
          class="mt-6"
          text
          color="success"
          @click="
            responseSheet = !responseSheet;
            response = '';
          "
        >
          {{ $t("misc.Close") }}
        </v-btn>
        <div class="my-3">
          {{ response }}
        </div>
      </v-sheet>
    </v-bottom-sheet>
  </v-container>
</template>

<script>
export default {
  props: {
    value: Boolean,
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
            this.$refs.loginForm.resetValidation();
            this.$refs.loginForm.reset();
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
      userLoading: false,
      apiUrl: process.env?.VUE_APP_G5V_API_URL || "/api",
      userInfo: {
        username: "",
        password: "",
        steam_id: ""
      }
    };
  },
  methods: {
    async userLogin() {
      if (this.$refs.loginForm.validate()) {
        this.userLoading = true;
        let userResponse;
        let userObject = {
          username: this.userInfo.username,
          password: this.userInfo.password
        };
        userResponse = await this.login(userObject);
        if (!userResponse.includes("Success")) {
          this.response = userResponse;
          this.responseSheet = true;
          this.userLoading = false;
        } else {
          window.location.reload();
        }
      }
    },
    async userRegister() {
      if (this.$refs.loginForm.validate()) {
        if (!this.userInfo.steam_id) {
          console.log("Failed successfully");
          this.response = "Invalid Steam 64 ID. Please enter a Steam ID.";
          this.responseSheet = true;
          this.userLoading = false;
          return;
        }
        this.userLoading = true;
        let userResponse;
        let userObject = {
          username: this.userInfo.username,
          password: this.userInfo.password,
          steam_id: this.userInfo.steam_id
        };
        userResponse = await this.register(userObject);
        if (!userResponse.includes("Success")) {
          this.response = userResponse;
          this.responseSheet = true;
          this.userLoading = false;
        } else {
          window.location.reload();
        }
      }
    }
  },
  async mounted() {
    this.user = await this.IsLoggedIn();
  }
};
</script>

<style scoped>
.font-orbitron {
  font-family: "Orbitron", sans-serif !important;
  letter-spacing: 2px;
}

.opacity-20 {
  opacity: 0.2;
}

.steam-login-btn {
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: grayscale(0.2);
}

.steam-login-btn:hover {
  transform: scale(1.05);
  filter: grayscale(0) drop-shadow(0 0 10px rgba(0, 242, 255, 0.4));
}

.steam-login-btn img {
  border-radius: 4px;
}

.letter-spacing-1 {
  letter-spacing: 1px !important;
}
</style>
