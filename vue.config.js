module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			contextIsolation: false,

			builderOptions: {
				productName: 'Money Manager',
				icon: 'public/favicon.png',
				copyright: `Copyright © 2021 Natscamp Productions`,
			},
		},
	},
};
