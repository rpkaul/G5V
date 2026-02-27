<template>
  <div>
    <v-app-bar
      app
      flat
      class="glass-navbar px-4 px-md-8"
      height="80"
    >
      <!-- Mobile Icon -->
      <v-app-bar-nav-icon 
        color="primary" 
        class="hidden-md-and-up mr-2" 
        @click.stop="$emit('toggle-drawer')" 
      />
      
      <!-- Branding (Always visible) -->
      <router-link to="/" class="text-decoration-none d-flex align-center mr-8">
        <v-icon color="primary" size="28" class="mr-2">mdi-shield-star</v-icon>
        <v-toolbar-title class="font-weight-black primary--text title-glow font-orbitron">
          {{ brandingName }}
        </v-toolbar-title>
      </router-link>

      <!-- Desktop Nav Links -->
      <div class="hidden-sm-and-down d-flex align-center flex-grow-1">
        <template v-for="(group, gIdx) in navLinks">
          <!-- Multi-item Dropdown -->
          <v-menu 
            v-if="group.items && group.items.length > 0" 
            :key="'group-' + gIdx" 
            offset-y 
            open-on-hover 
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                text
                v-bind="attrs"
                v-on="on"
                class="font-weight-bold text-uppercase letter-spacing-1 mr-2 px-4 nav-btn"
                :class="{ 'nav-link-active': isGroupActive(group) }"
              >
                {{ group.title }}
                <v-icon right small>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list class="glass-card mt-2 py-0" min-width="200">
              <v-list-item 
                v-for="(item, iIdx) in group.items" 
                :key="'item-' + gIdx + '-' + iIdx" 
                :to="item.to"
                exact
                active-class="primary--text"
              >
                <v-list-item-icon class="mr-3">
                  <v-icon small color="primary">{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="font-weight-bold text-uppercase body-2">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Simple Link -->
          <v-btn
            v-else
            :key="'link-' + gIdx"
            :to="group.to"
            text
            exact
            active-class="nav-link-active"
            class="font-weight-bold text-uppercase letter-spacing-1 mr-2 px-4 nav-btn"
          >
            {{ group.title }}
          </v-btn>
        </template>

        <!-- Create Buttons for Desktop -->
        <template v-if="user.id != null && user.id != -1">
          <v-btn
            color="primary"
            class="black--text font-weight-black ml-4 nav-create-btn"
            rounded
            :to="{ path: '/match/create', query: { season_id: $route.params.id || $route.query.season_id || undefined } }"
          >
            <v-icon left>mdi-sword</v-icon>
            {{ $t("Navbar.CreateMatch") }}
          </v-btn>
          <v-btn
            color="secondary"
            class="white--text font-weight-black ml-2 nav-create-btn"
            rounded
            to="/teams/create"
          >
            <v-icon left>mdi-account-multiple-plus</v-icon>
            {{ $t("Navbar.CreateTeam") }}
          </v-btn>
        </template>
      </div>

      <v-spacer class="hidden-sm-and-down"></v-spacer>

      <!-- User Zone -->
      <template v-if="user.id == null || user.id == -1">
        <v-btn
          depressed
          color="primary"
          class="black--text px-6 font-weight-bold neon-btn"
          rounded
          :href="apiUrl + '/auth/steam'"
        >
          <v-icon left size="20">mdi-steam</v-icon>
          Sign in via Steam
        </v-btn>
      </template>

      <template v-else>
        <div class="d-flex align-center">
          <div class="mr-4 text-right hidden-xs-only">
            <div class="caption grey--text text-uppercase letter-spacing-1">{{ $t("Navbar.Welcome") }}</div>
            <div class="body-2 white--text font-weight-black">{{ user.name }}</div>
          </div>
          <v-menu offset-y bottom left transition="slide-y-transition">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                class="profile-avatar-btn ml-2"
              >
                <v-avatar size="44" class="neon-border">
                  <v-img :src="user.small_image" />
                </v-avatar>
              </v-btn>
            </template>
            <v-list class="glass-card mt-2 py-0" min-width="200">
              <v-list-item :to="'/user/' + user.id">
                <v-list-item-icon><v-icon color="primary">mdi-account-circle</v-icon></v-list-item-icon>
                <v-list-item-title class="font-weight-bold">{{ user.name }}</v-list-item-title>
              </v-list-item>
              <v-divider class="mx-2 opacity-10" />
              <v-list-item :href="apiUrl + '/logout'">
                <v-list-item-icon><v-icon color="cyber-pink">mdi-logout-variant</v-icon></v-list-item-icon>
                <v-list-item-title class="cyber-pink--text font-weight-bold">{{ $t("Navbar.Logout") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-app-bar>

    <ServerDialog
      v-model="newDialog"
      :serverInfo="{}"
      :title="$t('MyServers.New')"
    />
  </div>
</template>
<script>
import ServerDialog from "./ServerDialog";
export default {
  name: "Navbar",
  props: {
    user: Object,
    navLinks: {
      type: Array,
      default: () => []
    }
  },
  components: {
    ServerDialog
  },
  data() {
    return {
      newDialog: false,
      apiUrl: process.env?.VUE_APP_G5V_API_URL || "/api"
    };
  },
  computed: {
    brandingName() {
      // Allow easy customization via translations or fallback
      return this.$t("Navbar.BrandingName") !== "Navbar.BrandingName" 
        ? this.$t("Navbar.BrandingName") 
        : "G5V";
    }
  },
  methods: {
    isGroupActive(group) {
      if (group.to && this.$route.path === group.to) return true;
      if (group.items) {
        return group.items.some(item => this.$route.path === item.to);
      }
      return false;
    }
  }
};
</script>

<style scoped>
.font-orbitron {
  font-family: "Orbitron", sans-serif !important;
}

.title-glow {
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
  font-size: 1.5rem !important;
  letter-spacing: 2px !important;
}

.letter-spacing-1 {
  letter-spacing: 1px !important;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.3s ease;
  position: relative;
}

.nav-btn:hover {
  color: var(--neon-cyan) !important;
}

.nav-link-active {
  color: var(--neon-cyan) !important;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    background: var(--neon-cyan);
    box-shadow: 0 0 10px var(--neon-cyan);
  }
}

.nav-create-btn {
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3) !important;
}

.neon-btn {
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

.neon-border {
  border: 2px solid var(--neon-cyan);
  box-shadow: 0 0 8px var(--neon-cyan);
}

.profile-avatar-btn:hover {
  transform: scale(1.05);
}

.opacity-10 {
  opacity: 0.1;
}

.glass-navbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
