<template>
  <v-client-table
    v-bind="$attrs"
    :columns="computedColumns"
    :options="computedOptions"
    :data="data"
    :class="[{
      'VueTables__table--hide-headers': noHeaders,
      'VuePagination--hide': !pagination,
      'VueTables__table--striped': striped,
      'VueTables__table--hover': hover,
      'VueTables__table--cursor-pointer': cursorPointer
    }]"
    @row-click="$emit('row-click', $event)"
    v-on="$listeners"
  >
    <slot
      v-for="value in columnsHeadings"
      :slot="`h__${value.key}`"
    >
      {{ value.text }}
    </slot>

    <slot
      v-for="(_, name) in $slots"
      :slot="name"
      :name="name"
    />
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData"
      />
    </template>
  </v-client-table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ClientTable } from 'vue-tables-2'

Vue.use(ClientTable)

type ColumnItem =
  string | {
    key: string,
    label?: string,
    class?: string
  }

@Component({
  name: 'Table'
})
export default class Table extends Vue {
  @Prop({ required: true, type: Array })
  columns!: Array<ColumnItem>

  @Prop({ required: true, type: Array })
  data!: Array<any>

  @Prop({ type: Object })
  options!: any

  @Prop({ type: Boolean })
  filterable!: boolean

  @Prop({ type: Boolean })
  noHeaders!: boolean

  @Prop({ type: Boolean })
  pagination!: boolean

  @Prop({ type: Boolean })
  striped!: boolean

  @Prop({ type: Boolean })
  hover!: boolean

  @Prop({ type: Boolean })
  cursorPointer!: boolean

  get computedColumns () {
    return this.columns.map((c: ColumnItem) => typeof c === 'string' ? c : c.key)
  }

  get columnsHeadings () {
    return this.columns
      .filter((c: ColumnItem) => typeof c !== 'string' && c.key)
      .map((c: ColumnItem) => {
        if (typeof c !== 'string') {
          return {
            key: c.key,
            text: c.label || ''
          }
        }
        return c
      })
  }

  get computedOptions () {
    const columnsClasses: any = {}

    this.columns.forEach((c: ColumnItem) => {
      if (typeof c === 'object') {
        columnsClasses[c.key] = c.class
      }
    })
    return {
      ...(this.options || {}),
      filterable: this.filterable,
      texts: this.options?.texts || {
        count: ''
      },
      pagination: {
        show: this.pagination
      },
      perPage: this.pagination ? 10 : 10000,
      perPageValues: this.pagination ? [10, 25, 50, 100] : [],
      columnsClasses: {
        ...(this.options?.columnsClasses || {}),
        ...columnsClasses
      }
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.VueTables {
  &__table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    text-align: left;
    font-weight: bold;

    th {
      @include typography(md-1, default, bold);
      color: $colorSecondaryDark1;
      padding: 15px 5px;
    }
  }

  &.VueTables__table--hover {
    tbody {
      tr:hover {
        background-color: $colorAliceShade;
      }
    }
  }

  &.VueTables__table--cursor-pointer {
    tbody {
      tr {
        cursor: pointer;
      }
    }
  }

  &.VueTables__table--hide-headers {
    thead {
      display: none;
    }
  }

  tbody {
    td {
      padding: 5px;
      vertical-align: middle;
    }
  }
}
.VueTables__table--striped {
  tbody {
    tr:nth-child(odd) {
      background-color: $colorLineGrey;
    }
  }
}

.VueTables--client {
  &.VuePagination--hide {
    .VuePagination {
      display: none;
    }
  }
}

.VueTables__no-results {
  text-align: center;
}
</style>
