<template>
  <div class="creation-header">
    <div class="creation-header__breadcrumbs">
      <BreadCrumbs>
        <template #workflow-name>
          <WorkflowName
            v-if="workflow"
            :name="workflow.name"
            @change="updateWorkflowName"
          />
        </template>
      </BreadCrumbs>
    </div>
    <CustomButton
      class="creation-header__save-button"
      flair="rounded"
      size="small"
      color="primary"
      @click.native="saveWorkflow"
    >
      Save and Apply
    </CustomButton>
  </div>
</template>
<script lang="ts">
import { upperFirst } from 'lodash'
import { computed, defineComponent, onMounted } from 'vue'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V2/BreadCrumbs.vue'
import CustomButton from '@/components/Common/Button/V2/CustomButton/CustomButton.vue'
import WorkflowName from '@/components/WorkflowCreation/WorkflowName.vue'
import { useHotkeyCombo } from '@/composables/useHotkeyCombo'
import { useRoute } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { useToast } from '@/composables/useToast'
import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import {
  SET_EDITED_WORKFLOW_NAME
} from '@/store/modules/V2Workflow/mutations/SET_EDITED_WORKFLOW_NAME'
import { StoreMutationPayload, ValidationError, } from '@/store/types'

/* silently updates URL to avoid unnecessary routing. */
const addHashToLocation = (path: string): void => { history.pushState({}, '', path) }

export default defineComponent({
  components: {
    BreadCrumbs, CustomButton, WorkflowName
  },
  setup () {
    const store = useStore()
    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)
    const route = useRoute()
    const toast = useToast()

    const updateWorkflowName = (newName: string): void => {
      const payload: StoreMutationPayload<typeof SET_EDITED_WORKFLOW_NAME> = newName
      store.commit('v2Workflow/SET_EDITED_WORKFLOW_NAME', payload)
    }

    const breadCrumbs: BreadCrumb[] = [
      { to: '/workflows', name: 'Workflows' },
      { slotName: 'workflow-name' }
    ]

    onMounted(() => {
      store.dispatch('ui/setBreadCrumbs', breadCrumbs)
    })

    const iterateObject = (obj: ValidationError): string => {
      return Object.keys(obj).map((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          return iterateObject(obj[key] as ValidationError)
        }

        return obj[key] as string
      })[0]
    }

    const saveWorkflow = async (): Promise<void>  => {
      if (!store.state.team.currentTeam) { return }
      const response = await store.dispatch('v2Workflow/submitWorkflow', {
        workflowId: route.params.workflowId,
        teamSlug: store.state.team.currentTeam.slug
      })

      if ('error' in response) {
        if (response.error?.status === 500) {
          return toast.warning({
            meta: { title: response.error.message },
            duration: 3000
          })
        }

        if (typeof response.error.stages === 'object') {
          const errorObject = (response.error.stages as ValidationError[]).filter(
            (obj) => Object.keys(obj).length !== 0
          )[0]
          if (!errorObject) { return }

          return toast.warning({
            meta: { title: upperFirst(iterateObject(errorObject)) },
            duration: 3000
          })
        }

        if (response.error.name !== undefined) {
          return toast.warning({
            meta: { title: `Name: ${response.error.name}` },
            duration: 3000
          })
        }
        return toast.warning({
          meta: { title: response.error.stages },
          duration: 3000
        })
      }

      addHashToLocation(route.path.replace(/new-workflow/, response.data.id))

      toast.success({
        meta: { title: 'Successfully saved workflow.' },
        duration: 3000
      })
    }

    useHotkeyCombo('s',
      saveWorkflow,
      {
        exact: true,
        mainKey: true
      }
    )

    return { updateWorkflowName, saveWorkflow, workflow  }
  }
})
</script>
<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.creation-header {
  align-items: center;
  background: $colorSurfaceElevate;
  display: grid;
  grid-template-columns: 1fr auto;
  height: 56px;
  justify-content: flex-start;
  text-align: center;
  width: 100%;
  @include typography(lg, inter, 500);
  gap: 0.5em;

  &__breadcrumbs {
    flex-grow: 1;
  }

  &__save-button {
    flex-shrink: 0;
  }
}

</style>
