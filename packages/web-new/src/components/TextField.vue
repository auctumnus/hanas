<script lang="ts">
import { ref, unref, type Ref, isRef } from 'vue'

const refify = <T>(value: T | Ref<T>): Ref<T> => {
    return isRef(value) ? value : ref(value)
}

type MaybeRef<T> = T | Ref<T>

type ValidationFunction = (this: TextFieldOptions) => boolean

interface CommonTextFieldConstructor {
    kind: 'filled' | 'outlined'
    name: MaybeRef<string>
    label: MaybeRef<string>
    maxLength?: MaybeRef<number | undefined>
    type?: MaybeRef<string | undefined>
    defaultValue?: string
    defaultHelperText?: string

    validate: ValidationFunction
}

interface MultilineTextFieldConstructor extends CommonTextFieldConstructor {
    multiline: true
    rows: number
}

export type TextFieldConstructor = CommonTextFieldConstructor | MultilineTextFieldConstructor

export class TextFieldOptions {
    public kind: 'filled' | 'outlined'

    public name: Ref<string>
    public label: Ref<string>
    public maxLength: Ref<number | undefined>
    public type: Ref<string | undefined>
    
    public model: Ref<string> = ref('')
    public hasError: Ref<boolean> = ref(false)
    public helperText: Ref<string> = ref('')

    public multiline: boolean
    public rows: number

    private _validate?: ValidationFunction

    validate() {
        if(this._validate) {
            return this._validate.call(this)
        }
        return true
    }

    constructor(options: TextFieldConstructor) {
        this.kind = options.kind
        this.name = refify(options.name)
        this.label = refify(options.label)
        this.maxLength = refify(options.maxLength)
        this.type = refify(options.type)

        this.model.value = options.defaultValue || ''
        this.helperText.value = options.defaultHelperText || ''

        if('multiline' in options) {
            this.multiline = true
            this.rows = options.rows
        } else {
            this.multiline = false
            this.rows = 1
        }

        this._validate = options.validate
    }

    setError(message: string) {
        this.hasError.value = true
        this.helperText.value = message
    }
}
</script>

<script setup lang="ts">
import { HTextField } from 'halcyon-vue'

defineProps<{ options: TextFieldOptions }>()
</script>

<template>
    <h-text-field
        :kind="options.kind"

        :name="options.name.value"
        :label="options.label.value"
        :max-length="options.maxLength.value"
        :has-error="options.hasError.value"
        v-model="options.model.value"

        @input="options.hasError.value = false"

        :multiline="options.multiline"
        :return-raw="options.multiline"
        :rows="options.rows"
    >
        <template #helper>
            <span v-if="options.helperText.value">{{ options.helperText.value }}</span>
        </template>
    </h-text-field>
</template>