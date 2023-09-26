<template>
  <v-row no-gutters>
    <v-col md="4" cols="12" class="text-center">
      <prefix-tree-image/>
    </v-col>

    <v-col md="8" cols="12">
      <v-container>
        <v-row class="align-center text-center">
          <v-col cols="12">
            <v-autocomplete
              :items="itemList"
              v-model:search="searchValue"
              v-on:update:search="loadItemList"
              clearable
              class="flex-full-width"
              density="comfortable"
              item-props
              placeholder="Search a phone"
              prepend-inner-icon="mdi-magnify"
              theme="light"
              flat
              hide-no-data
              variant="outlined"
              :menu-props="{
          transition: 'slide-y-transition',
          contentClass: 'custom-autocomplete-menu',
          nudgeBottom: 15 + 'px'
        }"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-container class="fill-height">
        <v-row
          class="fill-height"
          align="end"
          no-gutters
        >
          <v-col
            cols="12"
            class="bg-surface-variant text-wrap rounded" style="height: 30vh; overflow-y: scroll;">

            <template v-for="(record,i) in log.slice().reverse()" v-bind:key="i">
              <div class="w-100 px-2 py-1" style="background-color: #F5F7FB; color:#616E8C;" v-show="record.origin === 'client'">
                <v-chip variant="outlined" class="text-center me-4" style="width: 70px;">
                  client:
                </v-chip>
                <span class="font-italic text-sm-body-2" style="word-wrap: anywhere;">{{record.text}}</span>
              </div>

              <div class="w-100 px-2 py-1" style="background-color: #d9e0ef; color:#616E8C;" v-show="record.origin === 'server'">
                <v-chip variant="outlined" class="text-center me-4" style="width: 70px;">
                  server:
                </v-chip>
                <span class="font-italic text-sm-body-2" style="word-wrap: anywhere;">{{record.text}}</span>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { inject } from 'vue'
import api from '@/service/api'
import {stringify} from "qs";
import PrefixTreeImage from "@/components/PrevixTreeImage.vue";
export default {
  components: {PrefixTreeImage},
  setup(){
    const cryoptojs = inject('cryptojs')

    return {
      cryoptojs
    }
  },
  mounted(){

  },
  methods:{
    cleanupFilled(){
      this.svgPairs.forEach((item)=>{
        document.querySelector('#'+item[1]).classList.remove('filled-vertex');
      });
    },

    loadItemList(){
      this.cleanupFilled();

      // do not send too short search queries
      if(String(this.searchValue).length < 2){
        this.itemList = [];
        return;
      }

      // prepare search query -- each digit must be salted and hashed
      let query = []
      this.searchValue.split('').forEach((prefix_char)=>{
        query.push(this.cryoptojs.MD5(prefix_char + this.HASHING_SALT).toString());
      });

      this.log.push({
        origin: 'client',
        text: 'GET search?'+stringify({q:query}, { indices: false })
      });

      // issue search query
      this.axios.get('search', {params:{q:query}})
        .then(response => {
          // receive and decrypt found items
          this.itemList = [];
          response.data.records.forEach((v)=>{
            this.itemList.push(api.sym_enc(v.phone, this.ENCRYPTION_KEY));
          });

          this.log.push({
            origin: 'server',
            text: 'BODY '+JSON.stringify({records:response.data.records})
          });

          // highlight used prefix tree vertices in UI
          response.data._used_children.forEach((usedChild)=>{
            this.svgPairs.forEach((item)=>{
              if(usedChild !== item[0]) return;
              document.querySelector('#'+item[1]).classList.add('filled-vertex');
            });
          });
        }).catch(ex => {

          // report errors
          this.log.push({
            origin: 'server',
            text: 'ERROR '+ex.message
          });

          this.itemList = []
      })
    }
  },
  data(){
    return{
      itemList:[],
      log:[],
      searchValue:"",
      HASHING_SALT:"salt", // client holds salt value to prepare search queries
      ENCRYPTION_KEY:9, // client has encryption key to decrypt records
      // key-value pairs to display used prefix tree vertices in UI
      svgPairs:[
        ["6503829ab677d503ee1b5d91","svg-e0"],
        ["6503839bb677d503ee1b5d97","svg-e1"],
        ["65038428b677d503ee1b5d99","svg-e2"],
        ["650384bbb677d503ee1b5d9b","svg-e3"],
        ["650384f4b677d503ee1b5d9c","svg-e4"],
        ["6503851db677d503ee1b5d9e","svg-e5"],
        ["650385fdb677d503ee1b5da0","svg-e6"],
        ["65038654b677d503ee1b5da6","svg-e7"],
        ["65038721b677d503ee1b5daf","svg-e8"],
      ]
    }
  }
}
</script>
<style>
svg ellipse,path{
  stroke:#EBCA88!important;
}
svg path:nth-child(14),path:nth-child(16),path:nth-child(24){
  fill:#EBCA88!important;
}
svg div{
  color:#333!important;
}
.filled-vertex{
  fill:#616E8C!important;
}
</style>
