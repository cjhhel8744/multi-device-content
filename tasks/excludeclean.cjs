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

console.log('Cleaning working tree...')

deleteFolderRecursive('../deploy/.output/public/HTML_TEST')

console.log('Successfully cleaned working tree!')
