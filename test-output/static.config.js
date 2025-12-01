export default {
  getRoutes: async () => {
    return [
      {
        path: '/',
        template: 'src/pages/index',
      },
      {
        path: '/about',
        template: 'src/pages/about',
      },
      {
        path: '/404',
        template: 'src/pages/404',
      },
    ]
  },
  plugins: [
    'react-static-pro-plugin-react-router',
    'react-static-pro-plugin-sitemap',
  ],
}
