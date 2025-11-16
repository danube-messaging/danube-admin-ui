import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ClusterPage } from '../pages/ClusterPage';
import { BrokerPage } from '../pages/BrokerPage';
import { TopicPage } from '../pages/TopicPage';
import { TopicListPage } from '../pages/TopicListPage';
import { NamespacesPage } from '../pages/NamespacesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/cluster" replace />,
      },
      {
        path: 'cluster',
        element: <ClusterPage />,
      },
      {
        path: 'brokers/:id',
        element: <BrokerPage />,
      },
      {
        path: 'topics/:topic',
        element: <TopicPage />,
      },
      {
        path: 'topics',
        element: <TopicListPage />,
      },
      {
        path: 'namespaces',
        element: <NamespacesPage />,
      },
    ],
  },
]);
