<script lang="ts" setup>
import Recorder from '@/utils/record/Recorder'
definePageMeta({
	layout: 'empty',
})
useHead({
	title: 'MilkT Multi Device',
})

interface RecorderOption {
	time: { type: Number; default: 1 }
	bitRate: { type: Number; default: 128 }
	sampleRate: { type: Number; default: 44100 }
	backendEndpoint: { type: String }
	buttonColor: { type: String; default: 'green' }

	// callback functions
	afterRecording: { type: Function }
	successfulUpload: { type: Function }
	failedUpload: { type: Function }
	customUpload: { type: Function; default: null }
}

const INSTRUCTION_MESSAGE = 'Click icon to start recording message.'
const INSTRUCTION_MESSAGE_STOP = 'Click icon again to stop recording.'
const ERROR_MESSAGE =
	'Failed to use microphone. Please refresh and try again and permit the use of a microphone.'
const SUCCESS_MESSAGE = 'Successfully recorded message!'
const SUCCESS_MESSAGE_SUBMIT = 'Successfully submitted audio message! Thank you!'
const ERROR_SUBMITTING_MESSAGE = 'Error submitting audio message! Please try again later.'

const recording = ref()
const recordedAudio = ref()
const recordedBlob = ref()
const recorder = ref()
const successMessage = ref()
const errorMessage = ref()
let instructionMessage = INSTRUCTION_MESSAGE

const micFailed = () => {
	recording.value = false
	instructionMessage = INSTRUCTION_MESSAGE
	errorMessage.value = ERROR_MESSAGE
}
const initRecorder = () => {
	const options = { bitRate: 128, sampleRate: 44100 } as unknown as RecorderOption
	recorder.value = new Recorder({
		micFailed,
		bitRate: options.bitRate,
		sampleRate: options.sampleRate,
	})
	recorder.value.start()
	successMessage.value = null
	errorMessage.value = null
	instructionMessage = INSTRUCTION_MESSAGE_STOP
	// this.service = new Service(this.backendEndpoint)
}

const stopRecording = async () => {
	await recorder.value.stop()
	const recordList = recorder.value.recordList()
	recordedAudio.value = recordList[0].url
	recordedBlob.value = recordList[0].blob
	if (recordedAudio.value) {
		successMessage.value = SUCCESS_MESSAGE
		instructionMessage = ''
	}
	// if (afterRecording) {
	// 	afterRecording()
	// }
}
</script>

<template>
	<div>
		<h1>Test Site</h1>
		<div>
			<div>Mic Layer</div>
			<div class="text-sm font-bold">{{ successMessage }}</div>
			<div class="text-sm">{{ instructionMessage }}</div>
			<div class="text-sm text-red-400">{{ errorMessage }}</div>
			<button @click="initRecorder">Rec Start</button>
			<button @click="stopRecording">Rec Stop</button>
			<audio controls :src="recordedAudio" type="audio/mpeg" class="mx-auto">
				Your browser does not support the
				<code>audio</code> element.
			</audio>
		</div>
	</div>
</template>
