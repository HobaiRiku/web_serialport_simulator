<template>
  <el-container>
    <el-header class='header' height='64'>
      <el-row class="headerrow">
        <el-col class="headercol" :span="10" :offset="1">
          <h1 class="headertitlle">Web serialPort simulator</h1>
        </el-col>
        <el-col  :span="12" >
<span class="headertitlle">Port:{{info.serialPortName}}</span>
<span>&nbsp&nbsp</span>
<span class="headertitlle">baudRate:{{info.baudRate}}</span>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-main>
        <div class="content">
          <div>
    <div class="hr-div"></div>

    <div v-if="true" class="main-table">
      <div class="table-head" style="text-align: left;">
        <el-row class="table-title-row">
          <el-col class="table-title-col" :span="4">
            <span>Live data logs  </span>
          </el-col>
          <el-col :span="16">
            <el-button  type='success' class="tip-button" size="mini">
              count:{{frameList.length}} </el-button>
          </el-col>
          <el-col :span="4">
            <el-button class="create-button" size="mini" @click="clearLog">
              <i class="el-icon-refresh"></i> CLEAR</el-button>
          </el-col>
        </el-row>
      </div>

      <div class="row-div">
        <transition-group name="itemlist" tag="el-row">
        <el-row class="log-row" v-for="(frame,index) in frameList" :key="frame.id">
          <el-col class="log-col" :span="6">{{frame.date|timeFilter}}</el-col>
          <el-col class="log-col-text" :span="1">
            <i class="el-icon-minus"></i>
          </el-col>
          <el-col class="log-col" :span="16">{{frame.data}}</el-col>
        </el-row>
        </transition-group>
      </div>
    </div>
  </div>
  <div class="hr-div"></div>
    <div class="main-table">
<div class="table-head" style="text-align: left;">
        <el-row class="table-title-row">
          <el-col class="table-title-col" :span="4">
            <span>Data sent</span>
          </el-col>
          <el-col :span="16">
            <el-button  type='success' class="tip-button" size="mini">
              count:{{sentList.length}} </el-button>
          </el-col>
          <el-col :span="4">
            <el-button class="create-button" size="mini" @click="clearSentLog">
              <i class="el-icon-refresh"></i> CLEAR</el-button>
          </el-col>
        </el-row>
        
      </div>
      <div class="row-div2">
        <transition-group name="itemlist" tag="el-row">
        <el-row class="log-row" v-for="(sent,index) in sentList" :key='sent.id'>
          <el-col class="log-col" :span="6">{{sent.date|timeFilter}}</el-col>
          <el-col class="log-col-text" :span="1">
            <i class="el-icon-minus"></i>
          </el-col>
          <el-col class="log-col" :span="16">{{sent.data}}</el-col>
        </el-row>
        </transition-group>
      </div>

    </div>
    <div class="hr-div"></div>
  <el-row >
  <el-col :span="24" >
    <div  class="create-topic-div">
      <el-row>
        <el-col :span="24" >
<span class="create-topic-text">Data:</span>
     <el-input class="create-topic-input" style="width:600px;" size="small" v-model="dataSent" placeholder="e.g. af f7"></el-input>
        </el-col>
        <el-col :span="24" class='downcol' >
          <span v-if="isRepeat" class="create-topic-text2">delay(ms):</span>
      <el-input v-if="isRepeat"  style="width:80px;" size="small" v-model="delay" ></el-input>
      <el-checkbox class="create-topic-input" style="width:100px;" size='small' border v-model="isRepeat">isRepeat</el-checkbox>
      <el-button size="mini" type="primary"  :loading="isSending" @click="doSend">sent</el-button>
      <el-button v-if="isRepeat&&isSending"  size="mini" type="danger" @click="stop">stop</el-button>
        </el-col>
      </el-row>
    </div>
  </el-col>
</el-row>
        </div>

      </el-main>
    </el-container>
  </el-container>

</template>

<script>
import io from "../../io/io.js";
import * as api from "../../api";
export default {
  data() {
    return {
      frameList: [],
      sentList: [],
      info: {
        httpPort: "",
        serialPortName: "",
        baudRate: "",
        dataBits: "",
        parity: "",
        stopBits: ""
      },
      dataSent: "",
      delay: 1000,
      isRepeat: false,
      isSending: false,
      interval: ""
    };
  },
  computed: {},
  async mounted() {
    this.readFrameList();
    this.readSentList();
    let res = await api.getInfo();
    this.info = res.data;
    this.websocket();
  },
  methods: {
    clearLog() {
      this.frameList = [];
      this.saveFrameList();
    },
    clearSentLog() {
      this.sentList = [];
      this.saveSentList();
    },
    doSend() {
      try {
        let data = this.dataSent.split(" ");
        for (let one of data) {
          if (one.length < 1 || one.length > 2)
            throw new Error("sent fail: data format error");
        }
      } catch (error) {
        return this.$message.error(error.message);
      }
      let _this = this;
      if (this.isRepeat) {
        this.interval = setInterval(function() {
          _this.isSending = true;
          _this.postData();
        }, this.delay);
      } else {
        _this.postData();
      }
    },
    stop() {
      clearInterval(this.interval);
      if (this.isSending) this.isSending = false;
    },
    async postData() {
      try {
        let data = this.dataSent.split(" ");
        for (let one of data) {
          if (one.length < 1 || one.length > 2)
            throw new Error("sent fail: data format error");
        }
        let res = await api.postData({ data: this.dataSent });
        if (res.status !== 201) {
          return this.$message.error(res.data.message);
        }
        let oneLog = {
          id: Math.random()
            .toString(36)
            .substr(2),
          data: this.dataSent,
          date: new Date()
        };
        this.sentList.unshift(oneLog);
        this.saveSentList();
      } catch (error) {
        return this.$message.error(error.message);
      }
    },
    saveSentList() {
      localStorage.setItem("sentList", JSON.stringify(this.sentList));
    },
    readSentList() {
      let list = JSON.parse(localStorage.getItem("sentList"));
      if (!list) list = [];
      this.sentList = list;
    },
    saveFrameList() {
      localStorage.setItem("frameList", JSON.stringify(this.frameList));
    },
    readFrameList() {
      let list = JSON.parse(localStorage.getItem("frameList"));
      if (!list) list = [];
      this.frameList = list;
    },
    websocket() {
      Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
          if (this[i] == val) return i;
        }
        return -1;
      };
      Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
          this.splice(index, 1);
        }
      };

      let socket = io.connect(":" + this.info.httpPort);
      let _this = this;
      socket.on("data", function(msg) {
        _this.frameList.unshift(msg);
        _this.saveFrameList();
        console.log(msg);
      });
    }
  },
  watch: {}
};
</script>

<style>
.itemlist-enter-active,
.itemlist-leave-active {
  transition: all 1s;
}

.itemlist-enter,
.itemlist-leave-active {
  opacity: 0;
}
</style>