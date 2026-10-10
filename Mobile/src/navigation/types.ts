export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  UserDetail: { id: number };
  UserForm: { id?: number } | undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  UsersTab: undefined;
  UploadTab: undefined;
  BenchmarkTab: undefined;
};
