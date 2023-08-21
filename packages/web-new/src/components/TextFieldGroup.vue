<script lang="ts">
import type { Ref } from 'vue'
import TextField, { TextFieldOptions } from './TextField.vue'
import type { TextFieldConstructor } from './TextField.vue'

type Constructors = TextFieldConstructor[]

type Unref<T> = T extends Ref<infer U> ? U : T

type OptionName<T extends Constructors> = Unref<T[number]['name']>

type Values<Options extends Constructors> = Record<OptionName<Options>, string> 

export class TextFieldGroupOptions<Options extends Constructors> {
    public fields: TextFieldOptions[]

    constructor(fields: Options) {
        this.fields = fields.map(field => new TextFieldOptions(field))
    }

    private getValues(): Values<Options> {
        return Object.fromEntries(
            this.fields.map(field => [field.name.value, field.model.value])
        ) as Values<Options>
    }

    validate(): [boolean, Values<Options>] {
        const valid = this.fields.every(field => field.validate())
        const values = this.getValues()

        return [valid, values]
    }
}
</script>

<script setup lang="ts" generic="T extends Constructors">
defineProps<{ options: TextFieldGroupOptions<T> }>()
</script>

<template>
    <text-field
        v-for="field in options.fields"
        :key="field.name.value"
        :options="field"
    />
</template>