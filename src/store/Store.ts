import Vue from "vue"
import Vuex from "vuex"
import taskList from "@/store/TaskListStore"
import section from "@/store/SectionStore"

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    taskList,
    section,
  },
})



