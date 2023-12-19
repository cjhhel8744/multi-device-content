// clean.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

function deleteFolderRecursive(path) {
	if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
		fs.readdirSync(path).forEach(function (file, index) {
			const curPath = path + '/' + file

			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})

		console.log(`Deleting directory "${path}"...`)
		fs.rmdirSync(path)
	}
}
function deleteTargetFile(filePath) {
	// delete file named 'sample.txt'
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath)
		console.log(`Deleting file "${filePath}"...`)
	}
}

console.log('Cleaning working tree...')

deleteFolderRecursive('./node_modules/.cache')
deleteFolderRecursive('./.nuxt')
deleteFolderRecursive('./.output')
deleteFolderRecursive('./.nitro')
try {
	deleteFolderRecursive('../deploy/.output')
} catch {}

setTimeout(() => {
	deleteFolderRecursive('../deploy/.output')
}, 100)

console.log('Successfully cleaned working tree!')
