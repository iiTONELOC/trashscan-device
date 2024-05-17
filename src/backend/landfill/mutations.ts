export const loginMutation = (username: string, password: string, deviceKey: string) => {
  return {
    operationName: 'loginUserDevice',
    query:
      'mutation loginUserDevice($username: String!, $password: String!, $deviceKey: String!) {loginUserDevice(username: $username, password: $password, deviceKey: $deviceKey) {token user { _id  email username } }}',
    variables: {username, password, deviceKey},
  };
};

export const addItemMutation = (barcode: string) => {
  return {
    operationName: 'addItemToDefaultList',
    query: `mutation addItemToDefaultList($barcode: String!) {addItemToDefaultList(barcode: $barcode){_id isCompleted listId notes quantity product {_id productAlias productData {barcode name}}}}`,
    variables: {barcode},
  };
};

export const updateAliasMutation = (userProductId: string, alias: string) => {
  return {
    operationName: 'UpdateAlias',
    query: `mutation UpdateAlias($userProductId: ID!, $productAlias: String) { updateUserProduct(userProductId: $userProductId, productAlias: $productAlias) { _id createdAt productAlias productData { barcode createdAt } updatedAt } }`,
    variables: {userProductId, alias},
  };
};

export const reGenDeviceKeyMutation = (
  deviceKey: string,
  user: {username: string; password: string},
) => {
  return {
    operationName: 'RegenerateDeviceKeyFromDevice',
    query:
      'mutation RegenerateDeviceKeyFromDevice($deviceKey: String!, $username: String!, $password: String!) {regenerateDeviceKeyFromDevice(deviceKey: $deviceKey, username: $username, password: $password)}',
    variables: {deviceKey, username: user.username, password: user.password},
  };
};
