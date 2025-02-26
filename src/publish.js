const fs = require('fs')
const path = require('path')

const webExt = require('web-ext').default
const defaultAddonSigner = require('sign-addon').default

const { allowedChannels } = require('./constants')
const { verifyOptions } = require('./utils')

const publish = async options => {
    // This will create an unsigned xpi from sourceDir folder (dist) it will
    // then pass the unsigned xpi to the signing api, mozilla will validate the
    // xpi and sign it if it's legitimate. They will give us back a signed xpi
    // which will be placed into artifactsDir
    // If there's an error with the validation, webExt sign will log a link to
    // the console which will lead to the validation page which should contain
    // detailed reasons why the extension was rejected
    const {
        extensionId,
        artifactsDir,
        channel,
        sourceDir,
        targetXpi,
    } = verifyOptions(options, ['extensionId', 'targetXpi'])

    const { FIREFOX_API_KEY, FIREFOX_SECRET_KEY } = process.env

    const signAddon = async params => {
        const unsignedXpiFile = `unsigned-${targetXpi}`
        fs.writeFileSync(
            path.join(artifactsDir, unsignedXpiFile),
            fs.readFileSync(params.xpiPath),
        )
        const result = await defaultAddonSigner(params)
        if (
            channel === allowedChannels.LISTED &&
            !result.success &&
            result.errorCode === 'ADDON_NOT_AUTO_SIGNED'
        ) {
            result.success = true
            result.downloadedFiles = result.downloadedFiles || [unsignedXpiFile]
        }
        return result
    }

    const { downloadedFiles } = await webExt.cmd.sign(
        {
            apiKey: FIREFOX_API_KEY,
            apiSecret: FIREFOX_SECRET_KEY,
            artifactsDir,
            channel,
            id: extensionId,
            sourceDir,
        },
        { signAddon },
    )
    const [xpiFile] = downloadedFiles
    fs.renameSync(
        path.join(artifactsDir, xpiFile),
        path.join(artifactsDir, targetXpi),
    )
}

module.exports = {
    publish,
}
