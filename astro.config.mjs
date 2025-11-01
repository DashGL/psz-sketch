// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Density Dwarf',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Screens',
					items: [
						{ label: 'Title Screen', slug: 'screens/title-screen' },
						{ label: 'Sync', slug: 'screens/sync' },
						{ label: 'Character Select', slug: 'screens/character-select' },
						{ label: 'Character Create', slug: 'screens/character-create' },
						{ label: 'Mode Select', slug: 'screens/mode-select' },
						{
							label: 'City',
							items: [
								{ label: 'Overview', slug: 'screens/city' },
								{ label: 'Quest Counter', slug: 'screens/quest-counter' },
								{ label: 'Storage Counter', slug: 'screens/storage-counter' },
								{ label: 'Player Record', slug: 'screens/player-record' },
								{ label: 'Item Shop', slug: 'screens/item-shop' },
								{ label: 'Custom Shop', slug: 'screens/custom-shop' },
								{ label: 'Weapon Shop', slug: 'screens/weapon-shop' },
							],
						},
					],
				},
				{
					label: 'Mechanics',
					items: [
						{ label: 'Weapons', slug: 'mechanics/weapons' },
						{ label: 'Armor', slug: 'mechanics/armor' },
						{ label: 'Units', slug: 'mechanics/units' },
						{ label: 'Items', slug: 'mechanics/items' },
						{ label: 'Mags', slug: 'mechanics/mags' },
						{ label: 'Photon Blasts', slug: 'mechanics/photon-blasts' },
						{ label: 'Inventory', slug: 'mechanics/inventory' },
						{ label: 'Storage', slug: 'mechanics/storage' },
					],
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
