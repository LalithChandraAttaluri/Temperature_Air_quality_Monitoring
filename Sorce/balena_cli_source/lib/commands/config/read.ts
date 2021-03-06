/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { flags } from '@oclif/command';
import Command from '../../command';
import * as cf from '../../utils/common-flags';
import { getVisuals, stripIndent } from '../../utils/lazy';

interface FlagsDef {
	type: string;
	drive?: string;
	help: void;
}

export default class ConfigReadCmd extends Command {
	public static description = stripIndent`
		Read the configuration of a device or OS image.

		Read the config.json file from the mounted filesystem,
		e.g. the SD card of a provisioned device or balenaOS image.
	`;

	public static examples = [
		'$ balena config read --type raspberrypi3',
		'$ balena config read --type raspberrypi3 --drive /dev/disk2',
	];

	public static usage = 'config read';

	public static flags: flags.Input<FlagsDef> = {
		type: flags.string({
			description:
				'device type (Check available types with `balena devices supported`)',
			char: 't',
			required: true,
		}),
		drive: flags.string({
			description: 'device filesystem or OS image location',
			char: 'd',
		}),
		help: cf.help,
	};

	public static authenticated = true;

	public static root = true;

	public async run() {
		const { flags: options } = this.parse<FlagsDef, {}>(ConfigReadCmd);

		const { promisify } = await import('util');
		const umountAsync = promisify((await import('umount')).umount);

		const drive =
			options.drive || (await getVisuals().drive('Select the device drive'));
		await umountAsync(drive);

		const config = await import('balena-config-json');
		const configJSON = await config.read(drive, options.type);

		const prettyjson = await import('prettyjson');
		console.info(prettyjson.render(configJSON));
	}
}
