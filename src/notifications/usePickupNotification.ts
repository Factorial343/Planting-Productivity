import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type PickupNotificationAction = 'done' | 'keep_going' | 'open_prompt';

const CATEGORY_IDENTIFIER = 'pickup_prompt';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePickupNotification(
  onAction: (action: PickupNotificationAction) => void,
) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const onActionRef = useRef(onAction);
  const notificationIdRef = useRef<string | null>(null);

  onActionRef.current = onAction;

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pickup-prompts', {
        name: 'Session check-ins',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    await Notifications.setNotificationCategoryAsync(CATEGORY_IDENTIFIER, [
      {
        identifier: 'done',
        buttonTitle: 'Yes, End Session',
        options: { isDestructive: false, opensAppToForeground: true },
      },
      {
        identifier: 'keep_going',
        buttonTitle: 'Keep Going',
        options: { opensAppToForeground: true },
      },
    ]);

    const current = await Notifications.getPermissionsAsync();
    const finalStatus = current.status === 'granted'
      ? 'granted'
      : (await Notifications.requestPermissionsAsync()).status;
    setPermissionGranted(finalStatus === 'granted');
  }, []);

  useEffect(() => {
    void requestPermission();

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.notification.request.content.categoryIdentifier !== CATEGORY_IDENTIFIER) {
          return;
        }
        if (notificationIdRef.current) {
          void Notifications.dismissNotificationAsync(notificationIdRef.current);
          notificationIdRef.current = null;
        }

        if (response.actionIdentifier === 'done') {
          onActionRef.current('done');
        } else if (response.actionIdentifier === 'keep_going') {
          onActionRef.current('keep_going');
        } else if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          onActionRef.current('open_prompt');
        }
      });

    return () => responseSubscription.remove();
  }, [requestPermission]);

  const showPickupPrompt = useCallback(async () => {
    if (!permissionGranted) {
      await requestPermission();
    }

    if (notificationIdRef.current) {
      await Notifications.dismissNotificationAsync(notificationIdRef.current);
    }

    notificationIdRef.current = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Are you done?',
        body: 'End this session or keep going.',
        categoryIdentifier: CATEGORY_IDENTIFIER,
        data: { kind: 'pickup_prompt' },
      },
      trigger: null,
    });
  }, [permissionGranted, requestPermission]);

  const dismissPickupPrompt = useCallback(async () => {
    if (notificationIdRef.current) {
      await Notifications.dismissNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  return { permissionGranted, showPickupPrompt, dismissPickupPrompt };
}
