import { ErrorMessageGroup } from './types'

/** Defines all error codes explicitly set and sent by wind */
export enum WindErrorCodes {
  NO_PAYMENT_METHOD = 'NO_PAYMENT_METHOD',
  PARTNER_DOES_NOT_COVER_NEURAL_NETWORKS = 'PARTNER_DOES_NOT_COVER_NEURAL_NETWORKS'
}

/**
 * Defines all explicitly generated backend error codes which get a global
 * message defined in this module as `errorsByExplicitCode`
 */
export enum ErrorCodes {
  ALREADY_IN_WORKFLOW = 'ALREADY_IN_WORKFLOW',
  CARD_DECLINED = 'CARD_DECLINED',
  INSUFFICIENT_REMAINING_STORAGE = 'INSUFFICIENT_REMAINING_STORAGE',
  INVALID_URL = 'INVALID_URL',
  MODIFYING_COMPLETE_STAGE = 'MODIFYING_COMPLETE_STAGE',
  NO_AVAILABLE_WORK = 'NO_AVAILABLE_WORK',
  NOT_CURRENT_STAGE = 'NOT_CURRENT_STAGE',
  OUT_OF_ANNOTATION_CREDITS = 'OUT_OF_ANNOTATION_CREDITS',
  OUT_OF_SUBSCRIBED_ANNOTATION_CREDITS = 'OUT_OF_SUBSCRIBED_ANNOTATION_CREDITS',
  OUT_OF_SUBSCRIBED_STORAGE = 'OUT_OF_SUBSCRIBED_STORAGE',
  STORAGE_LIMIT_REACHED = 'STORAGE_LIMIT_REACHED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  SUBSCRIPTION_INCOMPLETE_EXPIRED = 'SUBSCRIPTION_INCOMPLETE_EXPIRED',
  SUBSCRIPTION_PAST_DUE = 'SUBSCRIPTION_PAST_DUE',
  SUBSCRIPTION_UNPAID = 'SUBSCRIPTION_UNPAID',
  TEAM_DISABLED = 'TEAM_DISABLED',
  UPDATING_ANNOTATION_WITHOUT_ID = 'UPDATING_ANNOTATION_WITHOUT_ID',
  WORKFLOW_ALREADY_COMPLETE = 'WORKFLOW_ALREADY_COMPLETE'
}

export const DEFAULT_ERROR = "Something's wrong. Try that action again"

/**
 * Defines all error messages for explicit error codes
 */
export const errorsByExplicitCode: { [k in ErrorCodes]: string } = {
  /* eslint-disable max-len */
  [ErrorCodes.ALREADY_IN_WORKFLOW]: 'The user is already part of the current workflow.',
  [ErrorCodes.CARD_DECLINED]: 'Unfortunately, your card has been declined. Please double-check your payment information.',
  [ErrorCodes.INSUFFICIENT_REMAINING_STORAGE]: 'You are about to exceed your total free storage (1000 images). Upgrade to a standard or academia account to upload more data.',
  [ErrorCodes.INVALID_URL]: 'The location you tried to access was invalid',
  [ErrorCodes.MODIFYING_COMPLETE_STAGE]: 'This stage has already been completed and cannot be reassigned.',
  [ErrorCodes.NO_AVAILABLE_WORK]: 'There is no more unassigned work available in this dataset. Try again later.',
  [ErrorCodes.NOT_CURRENT_STAGE]: 'This is not the current stage of the workflow. You can only make changes in the current stage.',
  [ErrorCodes.OUT_OF_ANNOTATION_CREDITS]: 'Your annotation credits have all been used up. Ask an admin to request more from our sales team.',
  [ErrorCodes.OUT_OF_SUBSCRIBED_ANNOTATION_CREDITS]: 'Your annotation credits have all been used up. Increase your subscribed amount from the settings page.',
  [ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE]: 'Your storage has been used up. Increase your subscribed amount from the settings page.',
  [ErrorCodes.STORAGE_LIMIT_REACHED]: 'You reached the free storage limit or 1000 images. Upgrade to a standard or academia account to upload more files.',
  [ErrorCodes.SUBSCRIPTION_CANCELLED]: 'Your subscription was cancelled. Please contact our support team.',
  [ErrorCodes.SUBSCRIPTION_INCOMPLETE_EXPIRED]: 'The first payment for your subscription has failed after several attempts. Please contact our support team.',
  [ErrorCodes.SUBSCRIPTION_PAST_DUE]: 'The payment for your subscription is past due. Please check your payment information.',
  [ErrorCodes.SUBSCRIPTION_UNPAID]: 'The payment for your subscription is past due. Please check your payment information.',
  [ErrorCodes.TEAM_DISABLED]: 'Your Team has been disabled. Please contact support@v7labs.com to get it re-enabled.',
  [ErrorCodes.UPDATING_ANNOTATION_WITHOUT_ID]: "This annotation couldn't be saved. Are you experiencing connection issues? Try refreshing your browser.",
  [ErrorCodes.WORKFLOW_ALREADY_COMPLETE]: 'This item has already been completed and cannot be reassigned.'
  /* eslint-enable max-len */
}

const errorsByImplicitCode = {
  /* eslint-disable max-len */
  ADMIN_ANNOTATION_CREDIT_CREATE_VALIDATION: 'Cannot create credits. Check the form and try again.',
  ADMIN_ANNOTATION_CREDIT_CREATE: 'Cannot create credits. Please try refreshing the page.',
  ADMIN_FEATURES_LOAD: 'Cannot load features. Please try refreshing the page.',
  ADMIN_TEAM_OWNER_INVITATIONS_CREATE_NOT_AUTHORIZED: 'Cannot create invitation. You are noth authorized to perform this action.',
  ADMIN_TEAM_OWNER_INVITATIONS_CREATE: 'Cannot create invitation. Please try refreshing the page.',
  ADMIN_TEAM_OWNER_INVITATIONS_LOAD: 'Cannot load invitations. Please try refreshing the page.',
  ADMIN_TEAM_LOAD: 'Cannot fetch team. Please try refreshing the page.',
  ADMIN_TEAM_UPDATE: 'Cannot update team. Try refreshing your browser',
  ADMIN_TEAMS_LOAD: 'Cannot fetch list of teams. Please try refreshing the page.',
  ANNOTATION_CLASS_CREATE_NOT_AUTHORIZED: "You don't have permission to create classes in this dataset. Ask an admin or user.",
  ANNOTATION_CLASS_CREATE: "Couldn't create this class. Check for errors and try again",
  ANNOTATION_CLASS_DELETE_NOT_AUTHORIZED: "You don't have permission to delete this class. Ask an admin or the dataset creator.",
  ANNOTATION_CLASS_NAME_EMPTY: 'Please include a class name',
  ANNOTATION_CLASS_SKELETON_EMPTY: 'A skeleton definition requires at least one edge (two nodes connected)',
  ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED: 'There was some trouble uploading your image. Please try again',
  ANNOTATION_CLASS_THUMBNAIL_NOT_LOADED: 'Please try selecting a thumbnail again',
  ANNOTATION_CLASS_TYPE_NON_SELECTED: 'Please pick an annotation type',
  ANNOTATION_CREATE_ATTRIBUTE_NOT_AUTHORIZED: 'You are not allowed to create new attributes',
  ANNOTATION_TYPE_LOAD_NOT_AUTHORIZED: "You don't have permission to view annotation types",
  ANNOTATION_TYPE_LOAD: "Something's wrong, cannot load annotation type options right now. Try refreshing your browser and try again",
  ANNOTATION_UPDATE_ATTRIBUTE_NOT_AUTHORIZED: 'You are not allowed to update attributes',
  ANNOTATIONS_LIMIT_REACHED: 'All free resources have been used. Upgrade to a standard account to continue annotating.',
  API_KEY_CREATE_NOT_AUTHORIZED: 'Cannot create key. Please try refreshing the page.',
  API_KEY_CREATE_NOT_FOUND: 'Cannot create key. Couldn`t find associated records.',
  API_KEY_CREATE: 'Cannot create key. Please try again.',
  API_KEY_DELETE_NOT_AUTHORIZED: 'Cannot revoke key. Please try refreshing the page.',
  API_KEY_DELETE_NOT_FOUND: 'Cannot revoke key. The specified key was not found.',
  API_KEY_DELETE: 'Cannot revoke key. Please try again.',
  API_KEY_SYNC: 'Cannot sync keys. Please try again.',
  API_KEY_UPDATE_NOT_AUTHORIZED: 'Cannot update key. Please try refreshing the page.',
  API_KEY_UPDATE_NOT_FOUND: 'Cannot update key. Couldn`t find associated records.',
  API_KEY_UPDATE: 'Cannot update key. Please try again.',
  API_KEYS_LOAD_NOT_AUTHORIZED: 'Cannot fetch data. Please try refreshing the page.',
  API_KEYS_LOAD: 'Cannot fetch data. Please try again.',
  ARCHIVED_IMAGE_LOAD_NOT_AUTHORIZED: "You don't have permission to view archived images. Ask an admin or dataset owner",
  ARCHIVED_IMAGE_LOAD: "Something's wrong, unable to load these images. Try refreshing your browser",
  AUTH_CONFIRM_INVITATION_BAD_REQUEST: 'Cannot confirm invitations. The request is invalid.',
  AUTH_CONFIRM_INVITATION_CANNOT_REACH_SERVER: 'Cannot confirm invitations. Cannot reach to the server.',
  AUTH_CONFIRM_INVITATION_DELETED_ALREADY: 'Cannot confirm invitations. The account has been deleted already.',
  AUTH_CONFIRM_INVITATION_INVALID_CREDENTIALS: 'Cannot confirm invitations. Your credentials are invalid.',
  AUTH_FORGOT_PASSWORD: 'Cannot send request password reset request.',
  AUTH_LOGIN_ACCOUNT_DELETED: 'Cannot login. Account deleted already.',
  AUTH_LOGIN_BAD_REQUEST: 'Cannot login. The request is invalid.',
  AUTH_LOGIN_CANNOT_REACH_SERVER: 'Cannot login. Cannot reach to the server.',
  AUTH_LOGIN_INVALID_CREDENTIALS: 'Invalid credentials. Check your email and password and try again.',
  AUTH_LOGIN_TOO_MANY_ATTEMPTS: "You tried to log in too many times. Please wait 5 minutes before trying again. If you've forgotten your password, you can try to reset it.",
  AUTH_LOGIN_WITH_TOKEN: 'Cannot log in with the token.',
  AUTH_LOGIN: 'Cannot log in with those credentials.',
  AUTH_CONFIRM_2FA: 'Code not recognized, please try again.',
  AUTH_SETUP_2FA: 'Cannot setup 2fa',
  AUTH_LOGOUT: 'Cannot log out due to technical issues.',
  AUTH_REFRESH_TOKEN: 'Cannot refresh the token.',
  AUTH_REGISTER: 'Cannot register with the email and password.',
  AUTH_RESET_PASSWORD: 'Cannot reset the password.',
  AUTH_SELECT_TEAM: 'Cannot select the team.',
  AUTH_VERIFY_INVITATION: 'Cannot verify invitation token.',
  AUTH_VERIFY_TEAM_OWNER_INVITATION: 'Cannot verify user invitation token.',
  BILLING_ADDRESS_INFO_MISSING: 'Please add valid billing details and a payment method to upgrade your plan',
  BILLING_INFO_CARD_CREATE: 'Something\'s wrong, unable to load billing tiers. Try refreshing your browser',
  BILLING_INFO_DEBIT_CREATE: 'Something\'s wrong, unable to create a billing account. Try refreshing your browser or contact support',
  DATASET_NOT_SELECTED: 'Cannot resolve current dataset. It might still be loading. Wait a bit and try again. If that fails, try refreshing the page.',
  DATASET_CREATE_NOT_AUTHORIZED: 'You don\'t have permission to create a new dataset. Ask an admin',
  DATASET_CREATE: 'Something\'s wrong, unable to create a dataset. Try refreshing your browser',
  DATASET_DELETE_NOT_AUTHORIZED: 'You don\'t have permission to delete this dataset. Ask an admin or dataset owner',
  DATASET_DELETE: 'Something\'s wrong, unable to delete this dataset. Try refreshing your browser',
  DATASET_ITEM_REPORT_DELETE_NOT_AUTHORIZED: 'You don\'t have permission to delete this report. Ask an admin or dataset owner',
  DATASET_ITEM_REPORT_DELETE: 'Something\'s wrong, unable to delete this report. Try refreshing your browser',
  DATASET_ITEM_REPORT_LOAD_NOT_AUTHORIZED: "You don't have permission to access reports. Ask an admin or dataset owner",
  DATASET_ITEM_REPORT_LOAD: "Something's wrong, couldn't load reports. Try refreshing your browser.",
  DATASET_ITEM_REPORT_CREATE_NOT_AUTHORIZED: "You don't have permission to create report. Ask an admin or dataset owner",
  DATASET_ITEM_REPORT_CREATE: "Something's wrong, couldn't create report. Try refreshing your browser.",
  DATASET_IMAGE_ANNOTATE: "Something's wrong. Couldn't annotate image. Try refreshing your browser or contact support",
  DATASET_IMAGE_DELETE_NOT_AUTHORIZED: 'You don\'t have permission to delete these images. Ask an admin or the dataset creator',
  DATASET_IMAGE_DELETE: 'Something\'s wrong, cannot delete these images. Try refreshing your browser',
  DATASET_IMAGE_RESTORE_NOT_AUTHORIZED: "You don't have permission to restore these images. Ask an admin or the dataset creator",
  DATASET_IMAGE_RESTORE: "Something's wrong, cannot restore these images. Try refreshing your browser",
  DATASET_ITEM_LOAD_NOT_AUTHORIZED: "You don't have permission to access this item. Ask an admin or dataset owner",
  DATASET_ITEM_LOAD: "Something's wrong, couldn't load information for this item. Try refreshing your browser.",
  DATASET_ITEMS_SELECTION_INVALID: "Couldn't update items. All selected items must have the same workflow and be in the same stage.",
  DATASET_ITEMS_MISSING_WORKFLOWS: 'Some of the selected items are already new or in an unsupported status, so they cannot be reset.',
  DATASET_ITEMS_NEW: 'Some of the selected items are new status, so they cannot be reset.',
  DATASET_ITEMS_UPDATE_NOT_AUTHORIZED: "You don't have permission to manage items in this dataset",
  DATASET_ITEMS_UPDATE: "Something's wrong, cannot manage right now. Try refreshing your browser and try again",
  DATASET_LOAD_NOT_AUTHORIZED: "You don't have permission to access this dataset. Ask an admin or dataset owner",
  DATASET_LOAD_NOT_AVAILABLE: 'The dataset you are trying to access is no longer available.',
  DATASET_LOAD: "Something's wrong, unable to load this dataset. Try refreshing your browser",
  DATASET_UPDATE_NOT_AUTHORIZED: 'You don\'t have permission to edit this dataset. Ask an admin or dataset owner',
  DATASET_UPDATE: 'Something\'s wrong, unable to update this dataset. Try refreshing your browser',
  DEFAULT: DEFAULT_ERROR,
  FEATURE_TOGGLE: "Something's wrong. Unable to toggle feature. Try refreshing your browser.",
  GENERAL_SERVICE_DOWN: 'One of our service seems to be offline. Please try again later.',
  GET_FEATURES: "Something's wrong. Unable to fetch feature. Try refreshing your browser.",
  INCORRECT_CLASS_USAGE: 'Provided class usage does not match current usage.',
  NETWORK_ERROR: 'There was a network error. Our service may be down, or you may have issues with your internet connectivity. Please try again',
  NEURAL_MODEL_DATA_NOT_AUTHORIZED: "You don't have permission to request model data. Ask an admin.",
  NEURAL_MODEL_DATA: "Something's wrong, unable to request model data. Try refreshing your browser.",
  NEURAL_MODEL_DEPLOY_NOT_AUTHORIZED: "You don't have permission to deploy this model. Ask an admin.",
  NEURAL_MODEL_DEPLOY: "Something's wrong, unable to deploy this model. Try refreshing your browser.",
  NEURAL_MODEL_ESTIMATE_NOT_AUTHORIZED: "You don't have permission to request cost estimate of this model. Ask an admin.",
  NEURAL_MODEL_ESTIMATE: "Something's wrong, unable to request cost estimate for this model. Try refreshing your browser.",
  NEURAL_MODEL_FETCH_NOT_AUTHORIZED: "You don't have permission to fetch models. Ask an admin.",
  NEURAL_MODEL_FETCH: "Something's wrong, unable to fetch models. Try refreshing your browser.",
  NEURAL_MODEL_INFER_NOT_AUTHORIZED: "You don't have permission to access this model. Ask an admin.",
  NEURAL_MODEL_INFER: "Something's wrong, unable to access this model. Try refreshing your browser.",
  NEURAL_MODEL_LOAD_NOT_AUTHORIZED: "You don't have permission to view this model. Ask an admin.",
  NEURAL_MODEL_LOAD: "Something's wrong, unable to fetch model. Try refreshing your browser.",
  NEURAL_MODEL_STOP_TRAINING_SESSION_NOT_AUTHORIZED: "You don't have permission to stop training this model. Ask an admin.",
  NEURAL_MODEL_STOP_TRAINING_SESSION: "Something's wrong, unable to stop training this model. Try refreshing your browser.",
  NEURAL_MODEL_TRAIN_NOT_AUTHORIZED: "You don't have permission to request training of this model. Ask an admin.",
  NEURAL_MODEL_TRAIN_PAYMENT_REQUIRED: 'You need to provide a valid payment method in order to train models.',
  NEURAL_MODEL_TRAIN: "Something's wrong, unable to request training for this model. Try refreshing your browser.",
  NEURAL_MODEL_UNDEPLOY_NOT_AUTHORIZED: "You don't have permission to undeploy this model. Ask an admin.",
  NEURAL_MODEL_UNDEPLOY: "Something's wrong, unable to undeploy this model. Try refreshing your browser.",
  NEURAL_MODEL_UPDATE_NOT_AUTHORIZED: "You don't have permission to update this model. Ask an admin.",
  NEURAL_MODEL_UPDATE: "Something's wrong, unable to update this model. Try refreshing your browser.",
  PAYMENT_NOT_SETUP: 'Please add valid billing details and a payment method to upgrade your plan',
  PAYMENT_PROCESSOR_COMMUNICATION_ISSUE: 'We\'re experiencing issues with processing this payment. Please try again in a two minutes or contact us if the problem persists',
  PARTNER_CREATE_INVITATION: "Something's wrong. Couldn't create the invite. Try refreshing your browser.",
  PARTNER_CREATE_INVITATION_NOT_AUTHORIZED: "You don't have permission to create invitations.",
  PROFILE_DELETE_NOT_AUTHORIZED: 'You don\'t have permission to delete this profile',
  PROFILE_LOAD: "Something's wrong. Unable to load your profile. Try refreshing your browser.",
  PROFILE_UPDATE_NOT_AUTHORIZED: "You don't have permission to update this profile",
  PROFILE_UPDATE: "Your profile hasn't successfully updated. Check for errors",
  PROFILE_VALIDATION: 'Something\'s wrong, check for errors in this page. Your profile has not been updated',
  REPORT_DOWNLOAD_NOT_AUTHORIZED: "You don't have permission to download reports. Ask an admin or user.",
  REPORT_DOWNLOAD: "Something's wrong, unable to download this report. Try refreshing your browser.",
  REPORT_LOAD_NOT_AUTHORIZED: "You don't have permission to view reports. Ask an admin or user.",
  REPORT_LOAD: "Something's wrong, unable to fetcg this report. Try refreshing your browser.",
  SOCKET_ERROR: 'There was an error connecting to our backend. Please try to refresh your browser.',
  STAGE_LOAD_NOT_AUTHORIZED: 'You are not authorized to view these annotations. Ask an admin or dataset owner.',
  STAGE_LOAD: "Something's wrong. Unable to load annotations. Try refreshing your browser.",
  STAGE_REQUEST: "Something's wrong, unable to request more work. Try refreshing your browser.",
  TEAM_LEAVE: 'Something unexpected went wrong when trying to remove user from team. If the problem persists, please contact support.',
  WIND_AUTH_CREATE: "Couldn't authenticate for model use. Try refreshing your browser.",
  WORKFLOW_CREATE: "Couldn't create workflow. Try refreshing your browser.",
  WORKFLOW_CREATE_NOT_AUTHORIZED: "You don't have permission to create workflows. Ask an admin or user.",
  WORKFLOW_CANNOT_MOVE_VIDEO_TO_FOLDER: 'You cannot move video frames to a folder without moving the parent video with them.',
  WORKFLOW_TEMPLATE_CREATE_NOT_AUTHORIZED: "You don't have permission to create a new template. Ask an admin or user.",
  WORKFLOW_TEMPLATE_CREATE: "Something's wrong, unable to create a new template. Try refreshing your browser.",
  WORKFLOW_TEMPLATE_NAME_EMPTY: 'Annotator workflow name cannot be empty',
  WORKFLOW_TEMPLATE_SET_DEFAULT_NOT_AUTHORIZED: "You don't have permission to update this dataset. Ask an admin or user.",
  WORKFLOW_TEMPLATE_SET_DEFAULT: "Something's wrong, unable to set default template for this dataset. Try refreshing your browser.",
  WORKFLOW_TEMPLATES_LOAD_NOT_AUTHORIZED: "You don't have permission to load templates. Ask an admin or user.",
  WORKFLOW_TEMPLATES_LOAD: "Something's wrong, unable to load templates data. Try refreshing your browser.",
  WORKFLOW_UPDATE_NOT_AUTHORIZED: "You don't have permission to update this workflow. Ask an admin or user.",
  WORKFLOW_UPDATE: "Something's wrong, unable to update workflow. Try refreshing your browser.",
  WORKFLOW_DELETE_NOT_AUTHORIZED: 'You don\'t have permission to delete this workflow. Ask an admin or dataset owner',
  WORKFLOW_DELETE: 'Something\'s wrong, unable to delete this workflow. Try refreshing your browser',
  WORKVIEW_ANNOTATIONS_LOAD_NOT_AUTHORIZED: "You don't have permission to view annotation data for this image. Ask an admin or user.",
  WORKVIEW_ANNOTATIONS_LOAD: "Something's wrong, unable to load annotation data. Try refreshing your browser.",
  WORKVIEW_IMAGES_LOAD_NOT_AUTHORIZED: "You don't have permission to view images. Ask an admin or user.",
  WORKVIEW_IMAGES_LOAD: "Something's wrong, unable to load image data. Try refreshing your browser.",
  STORAGE_CREATE: 'Something\'s wrong, unable to create a storage. Try refreshing your browser',
  STORAGE_GET: "Something's wrong, unable to load storages. Try refreshing your browser.",
  SAVE_SSO_CONFIG: "Something's wrong, unable to save SSO config. Check for errors or contact support.",
  LOAD_SSO_CONFIG: "Something's wrong, unable to load SSO config. Check for errors or contact support.",
  ANNOTATION_CREATE: "Couldn't create annotation. Try refreshing your browser.",
  ANNOTATION_CREATE_NOT_AUTHORIZED: "You don't have permission to create annotation.",
  ANNOTATION_UPDATE: "Couldn't update annotation. Try refreshing your browser.",
  ANNOTATION_UPDATE_NOT_AUTHORIZED: "You don't have permission to update annotation.",
  ANNOTATION_DELETE: "Couldn't delete annotation. Try refreshing your browser.",
  ANNOTATION_DELETE_NOT_AUTHORIZED: "You don't have permission to delete annotation.",
  /* eslint-enable max-len */
}

export const errorsByCode: Record<ErrorCodes | keyof typeof errorsByImplicitCode, string> = {
  ...errorsByExplicitCode,
  ...errorsByImplicitCode
}

/**
 * Lists out all supported error message groups for implicit error messages.
 * We need to list them out this way before using in `errorsMessages`, to get
 * type checking when calling them from store actions, etc.
 */
type ErrorMessageGroupName =
  'ADMIN_TEAM_OWNER_INVITATIONS_CREATE'
  | 'ADMIN_TEAM_OWNER_INVITATIONS_LOAD'
  | 'ADMIN_FEATURES_LOAD'
  | 'ADMIN_ANNOTATION_CREDIT_CREATE'
  | 'ADMIN_TEAM_LOAD'
  | 'ADMIN_TEAM_UPDATE'
  | 'ADMIN_TEAMS_LOAD'
  | 'ANNOTATION_CLASS_CREATE'
  | 'ANNOTATION_CLASS_DELETE'
  | 'ANNOTATION_CLASS_LOAD'
  | 'ANNOTATION_CLASS_UPDATE'
  | 'ANNOTATION_TYPE_LOAD'
  | 'API_KEY_CREATE'
  | 'API_KEY_DELETE'
  | 'API_KEY_SYNC'
  | 'API_KEY_UPDATE'
  | 'API_KEYS_LOAD'
  | 'ARCHIVED_IMAGE_LOAD'
  | 'ATTRIBUTE_CREATE'
  | 'ATTRIBUTE_DELETE'
  | 'AUTH_CONFIRM_INVITATION'
  | 'AUTH_FORGOT_PASSWORD'
  | 'AUTH_LOGIN_WITH_TOKEN'
  | 'AUTH_LOGIN'
  | 'AUTH_CONFIRM_2FA'
  | 'AUTH_SETUP_2FA'
  | 'AUTH_LOGOUT'
  | 'AUTH_REFRESH_TOKEN'
  | 'AUTH_REGISTER'
  | 'AUTH_RESET_PASSWORD'
  | 'AUTH_SELECT_TEAM'
  | 'AUTH_VERIFY_INVITATION'
  | 'AUTH_VERIFY_TEAM_OWNER_INVITATION'
  | 'BILLING_INFO_LOAD'
  | 'BILLING_INFO_UPDATE'
  | 'CLASSIFICATIONS_LOAD'
  | 'CLASS_USAGE_LOAD'
  | 'COMMENT_FOR_THREAD_CREATE'
  | 'COMMENT_FOR_THREAD_DELETE'
  | 'COMMENT_FOR_THREAD_UPDATE'
  | 'COMMENT_THREAD_CREATE'
  | 'COMMENT_THREAD_DELETE'
  | 'COMMENT_THREAD_UPDATE'
  | 'COMMENT_THREADS_LOAD'
  | 'COMMENTS_FOR_THREAD_LOAD'
  | 'COPY_ANNOTATION_CLASSES'
  | 'COUNTRIES_LOAD'
  | 'CREDIT_USAGE_LOAD'
  | 'CREDITS_LOAD'
  | 'DATASET_CREATE'
  | 'DATASET_DELETE'
  | 'DATASET_ITEM_REPORT_DELETE'
  | 'DATASET_ITEM_REPORT_LOAD'
  | 'DATASET_ITEM_REPORT_CREATE'
  | 'DATASET_EXPORT'
  | 'DATASET_FORK'
  | 'DATASET_IMAGE_ANNOTATE'
  | 'DATASET_IMAGE_DELETE'
  | 'DATASET_IMAGE_OPEN'
  | 'DATASET_IMAGE_RESTORE'
  | 'DATASET_IMAGE_TAG'
  | 'DATASET_IMAGE_UPLOAD_CONFIRMATION'
  | 'DATASET_IMAGE_UPLOAD'
  | 'DATASET_ITEM_LOAD'
  | 'DATASET_ITEMS_ADD_PRIORITY'
  | 'DATASET_ITEMS_UPDATE'
  | 'DATASET_LOAD'
  | 'DATASET_MOVE_ITEMS_TO_PATH'
  | 'DATASET_UPDATE'
  | 'DATASET_VIDEO_UPLOAD_CONFIRMATION'
  | 'DATASETS_LOAD'
  | 'FEATURE_TOGGLE'
  | 'FEEDBACK_SUBMIT'
  | 'GET_FEATURES'
  | 'INVOICES_LOAD'
  | 'INCORRECT_CLASS_USAGE'
  | 'NEURAL_MODEL_DATA'
  | 'NEURAL_MODEL_DEPLOY'
  | 'NEURAL_MODEL_ESTIMATE'
  | 'NEURAL_MODEL_INFER'
  | 'NEURAL_MODEL_LOAD'
  | 'NEURAL_MODEL_STOP_TRAINING_SESSION'
  | 'NEURAL_MODEL_TRAIN'
  | 'NEURAL_MODEL_UNDEPLOY'
  | 'NEURAL_MODEL_UPDATE'
  | 'PARTNER_CREATE_INVITATION'
  | 'PLAN_UPDATE'
  | 'PRODUCTS_LOAD'
  | 'PROFILE_DELETE'
  | 'PROFILE_LOAD'
  | 'PROFILE_UPDATE'
  | 'PROFILE_VALIDATION'
  | 'REPORT_DOWNLOAD'
  | 'REPORT_LOAD'
  | 'STAGE_LOAD'
  | 'STAGE_REQUEST'
  | 'TEAM_DELETE'
  | 'TEAM_LEAVE'
  | 'TEAM_LOAD'
  | 'TEAM_MEMBERS_ADD_INVITATIONS'
  | 'TEAM_MEMBERS_DELETE_INVITATION'
  | 'TEAM_MEMBERS_DELETE_MEMBERSHIP'
  | 'TEAM_MEMBERS_LOAD_INVITATIONS'
  | 'TEAM_MEMBERS_LOAD'
  | 'TEAM_MEMBERS_UPDATE_INVITATION'
  | 'TEAM_MEMBERS_UPDATE_MEMBERSHIP'
  | 'TEAM_REGISTER'
  | 'TEAM_UPDATE'
  | 'USAGE_LOAD'
  | 'WIND_AUTH_CREATE'
  | 'WORKFLOW_CREATE'
  | 'WORKFLOW_TEMPLATE_CREATE'
  | 'WORKFLOW_TEMPLATE_SET_DEFAULT'
  | 'WORKFLOW_TEMPLATES_LOAD'
  | 'WORKFLOW_UPDATE'
  | 'WORKFLOW_DELETE'
  | 'WORKFLOWS_LOAD'
  | 'WORKVIEW_ANNOTATIONS_LOAD'
  | 'WORKVIEW_IMAGES_LOAD'
  | 'STORAGE_CREATE'
  | 'STORAGE_GET'
  | 'STORAGE_DELETE'
  | 'STORAGE_UPDATE'
  | 'SAVE_SSO_CONFIG'
  | 'LOAD_SSO_CONFIG'
  | 'ANNOTATION_CREATE'
  | 'ANNOTATION_UPDATE'
  | 'ANNOTATION_DELETE'

/**
 * Exporting this directly means typescript would not detect if a group exists
 * or not, when calling `errorMessages.SOME_GROUP`.
 */
export const errorMessages: Record<ErrorMessageGroupName, ErrorMessageGroup> = {
  /* eslint-disable max-len */
  ADMIN_TEAM_OWNER_INVITATIONS_CREATE: {
    default: errorsByCode.ADMIN_TEAM_OWNER_INVITATIONS_CREATE,
    401: errorsByCode.ADMIN_TEAM_OWNER_INVITATIONS_CREATE_NOT_AUTHORIZED
  },
  ADMIN_TEAM_OWNER_INVITATIONS_LOAD: {
    default: errorsByCode.ADMIN_TEAM_OWNER_INVITATIONS_LOAD
  },
  ADMIN_FEATURES_LOAD: {
    default: errorsByCode.ADMIN_FEATURES_LOAD
  },
  ADMIN_ANNOTATION_CREDIT_CREATE: {
    default: errorsByCode.ADMIN_ANNOTATION_CREDIT_CREATE,
    422: errorsByCode.ADMIN_ANNOTATION_CREDIT_CREATE_VALIDATION
  },
  ADMIN_TEAMS_LOAD: {
    default: errorsByCode.ADMIN_TEAMS_LOAD
  },
  ADMIN_TEAM_LOAD: {
    default: errorsByCode.ADMIN_TEAM_LOAD
  },
  ADMIN_TEAM_UPDATE: {
    default: errorsByCode.ADMIN_TEAM_UPDATE
  },
  API_KEY_CREATE: {
    default: errorsByCode.API_KEY_CREATE,
    401: errorsByCode.API_KEY_CREATE_NOT_AUTHORIZED,
    404: errorsByCode.API_KEY_CREATE_NOT_FOUND
  },
  API_KEY_DELETE: {
    default: errorsByCode.API_KEY_DELETE,
    401: errorsByCode.API_KEY_DELETE_NOT_AUTHORIZED,
    404: errorsByCode.API_KEY_DELETE_NOT_FOUND
  },
  API_KEY_UPDATE: {
    default: errorsByCode.API_KEY_UPDATE,
    401: errorsByCode.API_KEY_UPDATE_NOT_AUTHORIZED,
    404: errorsByCode.API_KEY_UPDATE_NOT_FOUND
  },
  API_KEYS_LOAD: {
    default: errorsByCode.API_KEYS_LOAD,
    401: errorsByCode.API_KEYS_LOAD_NOT_AUTHORIZED
  },
  API_KEY_SYNC: {
    default: errorsByCode.API_KEY_SYNC
  },
  AUTH_LOGOUT: {
    default: errorsByCode.AUTH_LOGOUT
  },
  AUTH_LOGIN: {
    400: errorsByCode.AUTH_LOGIN_BAD_REQUEST,
    401: errorsByCode.AUTH_LOGIN_INVALID_CREDENTIALS,
    410: errorsByCode.AUTH_LOGIN_ACCOUNT_DELETED,
    429: errorsByCode.AUTH_LOGIN_TOO_MANY_ATTEMPTS,
    502: errorsByCode.AUTH_LOGIN_CANNOT_REACH_SERVER,
    default: errorsByCode.AUTH_LOGIN
  },
  AUTH_CONFIRM_2FA: {
    default: errorsByCode.AUTH_CONFIRM_2FA
  },
  AUTH_SETUP_2FA: {
    default: errorsByCode.AUTH_SETUP_2FA
  },
  AUTH_FORGOT_PASSWORD: { default: errorsByCode.AUTH_FORGOT_PASSWORD },
  AUTH_RESET_PASSWORD: {
    default: errorsByCode.AUTH_RESET_PASSWORD
  },
  AUTH_LOGIN_WITH_TOKEN: {
    default: errorsByCode.AUTH_LOGIN_WITH_TOKEN
  },
  AUTH_REFRESH_TOKEN: {
    default: errorsByCode.AUTH_REFRESH_TOKEN
  },
  AUTH_REGISTER: {
    default: errorsByCode.AUTH_REGISTER
  },
  AUTH_VERIFY_INVITATION: {
    default: errorsByCode.AUTH_VERIFY_INVITATION
  },
  AUTH_CONFIRM_INVITATION: {
    400: errorsByCode.AUTH_CONFIRM_INVITATION_BAD_REQUEST,
    401: errorsByCode.AUTH_CONFIRM_INVITATION_INVALID_CREDENTIALS,
    410: errorsByCode.AUTH_CONFIRM_INVITATION_DELETED_ALREADY,
    502: errorsByCode.AUTH_CONFIRM_INVITATION_CANNOT_REACH_SERVER,
    default: 'Cannot confirm invitation.'
  },
  AUTH_SELECT_TEAM: {
    default: errorsByCode.AUTH_SELECT_TEAM
  },
  AUTH_VERIFY_TEAM_OWNER_INVITATION: {
    default: errorsByCode.AUTH_VERIFY_TEAM_OWNER_INVITATION
  },
  ARCHIVED_IMAGE_LOAD: {
    401: errorsByCode.ARCHIVED_IMAGE_LOAD_NOT_AUTHORIZED,
    default: errorsByCode.ARCHIVED_IMAGE_LOAD
  },
  BILLING_INFO_LOAD: {
    401: 'You don\'t have permission to view billing info. Ask an admin or team owner',
    default: 'Cannot load billing info. Try refreshing your browser'
  },
  BILLING_INFO_UPDATE: {
    401: 'You don\'t have permission to change billing info. Ask the team owner',
    default: 'Failed to change billing info. Check for errors or refresh your browser and try again'
  },
  CLASSIFICATIONS_LOAD: {
    401: 'You don\'t have permission to view tags',
    default: 'Tags aren\'t loading. Try refreshing your browser'
  },
  CLASS_USAGE_LOAD: {
    401: 'You don\'t have permission to view class usage',
    default: 'Something\'s wrong, cannot load class usage. Check for errors or try refreshing your browser'
  },
  COMMENT_THREADS_LOAD: {
    401: 'You don\'t have permission to view these comments',
    404: 'This comment thread cannot be found (404)',
    default: 'This comment thread isn\'t loading as expected. Check for errors or try refreshing your browser'
  },
  COMMENTS_FOR_THREAD_LOAD: {
    401: 'You don\'t have permission to view a comment in this thread',
    404: 'This comment cannot be found (404)',
    default: 'This comment isn\'t loading as expected. Check for errors or try refreshing your browser'
  },
  COMMENT_THREAD_CREATE: {
    401: 'You don\'t have permission to view a comment in this thread',
    default: 'Something\'s wrong, cannot create this comment. Check for errors or try refreshing your browser'
  },
  COMMENT_FOR_THREAD_CREATE: {
    401: 'You don\'t have permission to post a comment',
    default: 'Something\'s wrong, cannot post this comment. Check for errors or try refreshing your browser'
  },
  COMMENT_THREAD_UPDATE: {
    401: 'You don\'t have permission to update this comment',
    default: 'Something\'s wrong, cannot update this comment.'
  },
  COMMENT_FOR_THREAD_UPDATE: {
    401: 'You don\'t have permission to update this comment',
    default: 'Something\'s wrong, cannot update this comment'
  },
  COMMENT_THREAD_DELETE: {
    401: 'You don\'t have permission to delete this thread',
    default: 'Something\'s wrong, cannot delete this thread. Check for errors or try refreshing your browser'
  },
  COMMENT_FOR_THREAD_DELETE: {
    401: 'You don\'t have permission to delete this thread',
    default: 'Something\'s wrong, cannot delete this thread. Check for errors or try refreshing your browser'
  },
  COUNTRIES_LOAD: {
    default: 'Something\'s wrong, cannot load countries'
  },
  CREDIT_USAGE_LOAD: {
    401: 'You don\'t have permission to load credit usage',
    default: 'Something\'s wrong, cannot load credit usage. Check for errors or try refreshing your browser'
  },
  DATASET_LOAD: {
    401: errorsByCode.DATASET_LOAD_NOT_AUTHORIZED,
    410: errorsByCode.DATASET_LOAD_NOT_AVAILABLE,
    default: errorsByCode.DATASET_LOAD
  },
  DATASETS_LOAD: {
    401: 'You don\'t have permission to view these datasets',
    default: 'Something\'s wrong, unable to load datasets. Try refreshing your browser'
  },
  DATASET_CREATE: {
    401: errorsByCode.DATASET_CREATE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_CREATE
  },
  DATASET_DELETE: {
    401: errorsByCode.DATASET_DELETE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_DELETE
  },
  DATASET_ITEM_REPORT_DELETE: {
    401: errorsByCode.DATASET_ITEM_REPORT_DELETE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_ITEM_REPORT_DELETE
  },
  DATASET_ITEM_REPORT_LOAD: {
    401: errorsByCode.DATASET_ITEM_REPORT_LOAD_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_ITEM_REPORT_LOAD
  },
  DATASET_ITEM_REPORT_CREATE: {
    401: errorsByCode.DATASET_ITEM_REPORT_CREATE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_ITEM_REPORT_CREATE
  },
  DATASET_UPDATE: {
    401: errorsByCode.DATASET_UPDATE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_UPDATE
  },
  DATASET_EXPORT: {
    401: 'You don\'t have permission to export this dataset',
    default: 'Something\'s wrong, cannot update this dataset. Check for any errors'
  },
  DATASET_FORK: {
    401: 'You don\'t have permission to duplicate this dataset',
    default: 'Something\'s wrong, cannot duplicate this dataset. Try refreshing your browser'
  },
  DATASET_IMAGE_OPEN: {
    default: 'You don\'t have permission to annotate this image'
  },
  DATASET_IMAGE_TAG: {
    401: 'You don\'t have permission to tag these images',
    default: 'Something\'s wrong, cannot tag these images. Try refreshing your browser'
  },
  DATASET_IMAGE_ANNOTATE: {
    default: errorsByCode.DATASET_IMAGE_ANNOTATE
  },
  DATASET_IMAGE_DELETE: {
    401: errorsByCode.DATASET_IMAGE_DELETE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_IMAGE_DELETE
  },
  DATASET_IMAGE_RESTORE: {
    401: errorsByCode.DATASET_IMAGE_RESTORE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_IMAGE_RESTORE
  },
  DATASET_IMAGE_UPLOAD: {
    401: 'You don\'t have permission to upload images here',
    default: 'An image failed to upload. Check for corrupt files or incompatible formats'
  },
  DATASET_ITEMS_ADD_PRIORITY: {
    401: 'You don\'t have permission to add priorities here',
    default: 'Cannot add priority to the dataset items. Check for errors or refresh your browser'
  },
  DATASET_ITEM_LOAD: {
    401: errorsByCode.DATASET_ITEM_LOAD_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_ITEM_LOAD
  },
  DATASET_VIDEO_UPLOAD_CONFIRMATION: {
    default: 'A video failed to upload. Your connection may have been interrupted or its format is incompatible'
  },
  DATASET_IMAGE_UPLOAD_CONFIRMATION: {
    default: 'An image failed to upload. Your connection may have been interrupted, try uploading it again'
  },
  DATASET_MOVE_ITEMS_TO_PATH: {
    default: 'Cannot move items to path'
  },
  FEATURE_TOGGLE: {
    default: errorsByCode.FEATURE_TOGGLE
  },
  GET_FEATURES: {
    default: errorsByCode.GET_FEATURES
  },
  INVOICES_LOAD: {
    401: 'You don\'t have permission to view this team\'s invoices',
    default: 'Something\'s wrong, cannot reach invoices. Check your connection or contact support'
  },
  INCORRECT_CLASS_USAGE: {
    default: errorsByCode.INCORRECT_CLASS_USAGE
  },
  NEURAL_MODEL_DATA: {
    401: errorsByCode.NEURAL_MODEL_DATA_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_DATA
  },
  NEURAL_MODEL_INFER: {
    403: errorsByCode.NEURAL_MODEL_INFER_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_INFER
  },
  NEURAL_MODEL_DEPLOY: {
    401: errorsByCode.NEURAL_MODEL_DEPLOY_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_DEPLOY
  },
  NEURAL_MODEL_ESTIMATE: {
    401: errorsByCode.NEURAL_MODEL_ESTIMATE_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_ESTIMATE
  },
  NEURAL_MODEL_LOAD: {
    401: errorsByCode.NEURAL_MODEL_LOAD_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_LOAD
  },
  NEURAL_MODEL_STOP_TRAINING_SESSION: {
    401: errorsByCode.NEURAL_MODEL_STOP_TRAINING_SESSION_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_STOP_TRAINING_SESSION
  },
  NEURAL_MODEL_TRAIN: {
    401: errorsByCode.NEURAL_MODEL_TRAIN_NOT_AUTHORIZED,
    402: errorsByCode.NEURAL_MODEL_TRAIN_PAYMENT_REQUIRED,
    503: errorsByCode.GENERAL_SERVICE_DOWN,
    default: errorsByCode.NEURAL_MODEL_TRAIN
  },
  NEURAL_MODEL_UNDEPLOY: {
    401: errorsByCode.NEURAL_MODEL_UNDEPLOY_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_UNDEPLOY
  },
  NEURAL_MODEL_UPDATE: {
    401: errorsByCode.NEURAL_MODEL_DEPLOY_NOT_AUTHORIZED,
    default: errorsByCode.NEURAL_MODEL_UPDATE
  },
  PARTNER_CREATE_INVITATION: {
    default: errorsByCode.PARTNER_CREATE_INVITATION,
    401: errorsByCode.PARTNER_CREATE_INVITATION_NOT_AUTHORIZED
  },
  PLAN_UPDATE: {
    401: 'You don\'t have permission to change this team\'s plan. Ask the team owner',
    default: 'We weren\'t able to change your plan. Check for errors or contact support'
  },
  PRODUCTS_LOAD: {
    401: 'You don\'t have permission to view pricing tiers',
    default: 'We weren\'t able to display pricing tiers. Try refreshing your browser'
  },
  PROFILE_DELETE: {
    default: 'Something\'s wrong, cannot delete your profile. Check for errors or refresh your browser',
    401: errorsByCode.PROFILE_DELETE_NOT_AUTHORIZED
  },
  PROFILE_LOAD: { default: errorsByCode.PROFILE_LOAD },
  PROFILE_UPDATE: {
    default: errorsByCode.PROFILE_UPDATE,
    401: errorsByCode.PROFILE_UPDATE_NOT_AUTHORIZED,
    422: errorsByCode.PROFILE_VALIDATION
  },
  PROFILE_VALIDATION: {
    default: errorsByCode.PROFILE_VALIDATION
  },
  REPORT_DOWNLOAD: {
    default: errorsByCode.REPORT_DOWNLOAD,
    401: errorsByCode.REPORT_DOWNLOAD_NOT_AUTHORIZED
  },
  REPORT_LOAD: {
    default: errorsByCode.REPORT_LOAD,
    401: errorsByCode.REPORT_LOAD_NOT_AUTHORIZED
  },
  STAGE_REQUEST: {
    default: errorsByCode.STAGE_REQUEST
  },
  STAGE_LOAD: {
    default: errorsByCode.STAGE_LOAD,
    401: errorsByCode.STAGE_LOAD_NOT_AUTHORIZED
  },
  DATASET_ITEMS_UPDATE: {
    401: errorsByCode.DATASET_ITEMS_UPDATE_NOT_AUTHORIZED,
    default: errorsByCode.DATASET_ITEMS_UPDATE
  },
  TEAM_LOAD: {
    401: 'Cannot load team profile. You do not have permissions to perform this action.',
    default: 'Team profile could not be loaded due to technical issues.'
  },
  TEAM_REGISTER: {
    401: 'Cannot create team profile. You do not have permissions to perform this action.',
    default: 'Team profile could not be created due to technical issues.'
  },
  TEAM_UPDATE: {
    401: 'You don\'t have permission to change team details',
    422: 'The Team profile hasn\'t successfully updated. Check for errors',
    default: 'The Team profile hasn\'t successfully updated. Check for errors'
  },
  TEAM_LEAVE: {
    401: 'Cannot update team profile. You do not have permissions to perform this action.',
    default: 'Cannot leave the team due to technical issues.'
  },
  TEAM_DELETE: {
    401: 'You don\'t have permission to delete this team',
    default: 'Your team hasn\'t successfully been deleted. Check for errors or contact support'
  },
  TEAM_MEMBERS_LOAD: {
    401: 'You don\'t have permission to browse team members',
    default: 'Something\'s wrong, cannot load team members right now. Try refreshing your browser and try again'
  },
  TEAM_MEMBERS_LOAD_INVITATIONS: {
    401: 'You don\'t have permission to browse team invitations',
    default: 'Something\'s wrong, cannot load team invitations right now. Try refreshing your browser and try again'
  },
  TEAM_MEMBERS_ADD_INVITATIONS: {
    401: 'You don\'t have permission to invite users to this team',
    default: 'Unable to invite users to this team, please try again'
  },
  TEAM_MEMBERS_UPDATE_INVITATION: {
    parametric: ({ email }) => `Unable to change role for invited user ${email}, please try again`,
    default: 'Unable to change invited user\'s role, please try again'
  },
  TEAM_MEMBERS_DELETE_INVITATION: {
    parametric: ({ email }) => `Unable to revoke invitation for ${email}, please try again`,
    default: 'Unable to revoke user\'s invitation to this team, please try again'
  },
  TEAM_MEMBERS_UPDATE_MEMBERSHIP: {
    parametric: ({ userFullName, role }) => `Unable to change ${userFullName}'s role to ${role}, please try again`,
    default: 'Unable to change user\'s role, please try again'
  },
  TEAM_MEMBERS_DELETE_MEMBERSHIP: {
    parametric: ({ userFullName }) => `Unable to revoke ${userFullName}'s membership to this team, please try again`,
    default: 'Unable to revoke user\'s membership to this team, please try again'
  },
  USAGE_LOAD: {
    401: 'You don\'t have permission to view this team\'s usage data',
    default: 'Something\'s wrong, cannot load usage data right now. Try refreshing your browser and try again'
  },
  CREDITS_LOAD: {
    401: 'You don\'t have permission to view this team\'s credits',
    default: 'Something\'s wrong, cannot load credits right now. Try refreshing your browser and try again'
  },
  ANNOTATION_TYPE_LOAD: {
    401: errorsByCode.ANNOTATION_TYPE_LOAD_NOT_AUTHORIZED,
    default: errorsByCode.ANNOTATION_TYPE_LOAD
  },
  ANNOTATION_CLASS_LOAD: {
    401: 'You don\'t have permission to view this dataset\'s classes',
    default: 'Something\'s wrong, cannot load this dataset\'s classes right now. Try refreshing your browser and try again'
  },
  ANNOTATION_CLASS_CREATE: {
    401: errorsByCode.ANNOTATION_CLASS_CREATE_NOT_AUTHORIZED,
    default: errorsByCode.ANNOTATION_CLASS_CREATE
  },
  ANNOTATION_CLASS_UPDATE: {
    401: 'You don\'t have permission to edit this class',
    default: 'Couldn\'t update this class. Check for errors and try again'
  },
  ANNOTATION_CLASS_DELETE: {
    401: 'You don\'t have permission to delete this class',
    default: 'Couldn\'t delete this class. Check for errors or try refreshing your browser'
  },
  COPY_ANNOTATION_CLASSES: {
    default: 'Couldn\'t copy these classes. Check for errors or try refreshing your browser'
  },
  ATTRIBUTE_CREATE: {
    default: 'Couldn\'t create or fetch the attribute'
  },
  ATTRIBUTE_DELETE: {
    default: 'Couldn\'t delete the attribute'
  },
  FEEDBACK_SUBMIT: {
    default: 'Couldn\'t submit the feedback. Please try again.'
  },
  WIND_AUTH_CREATE: {
    default: errorsByCode.WIND_AUTH_CREATE
  },
  WORKVIEW_ANNOTATIONS_LOAD: {
    default: errorsByCode.WORKVIEW_ANNOTATIONS_LOAD,
    401: errorsByCode.WORKVIEW_ANNOTATIONS_LOAD_NOT_AUTHORIZED
  },
  WORKVIEW_IMAGES_LOAD: {
    default: errorsByCode.WORKVIEW_IMAGES_LOAD,
    401: errorsByCode.WORKVIEW_IMAGES_LOAD_NOT_AUTHORIZED
  },
  WORKFLOW_TEMPLATES_LOAD: {
    default: errorsByCode.WORKFLOW_TEMPLATES_LOAD,
    401: errorsByCode.WORKFLOW_TEMPLATES_LOAD_NOT_AUTHORIZED
  },
  WORKFLOW_TEMPLATE_CREATE: {
    default: errorsByCode.WORKFLOW_TEMPLATE_CREATE,
    401: errorsByCode.WORKFLOW_TEMPLATE_CREATE_NOT_AUTHORIZED
  },
  WORKFLOW_TEMPLATE_SET_DEFAULT: {
    default: errorsByCode.WORKFLOW_TEMPLATE_SET_DEFAULT,
    401: errorsByCode.WORKFLOW_TEMPLATE_SET_DEFAULT_NOT_AUTHORIZED
  },
  WORKFLOW_CREATE: {
    401: errorsByCode.WORKFLOW_CREATE_NOT_AUTHORIZED,
    default: errorsByCode.WORKFLOW_CREATE
  },
  WORKFLOW_DELETE: {
    401: errorsByCode.WORKFLOW_DELETE_NOT_AUTHORIZED,
    default: errorsByCode.WORKFLOW_DELETE
  },
  WORKFLOW_UPDATE: {
    401: errorsByCode.WORKFLOW_UPDATE_NOT_AUTHORIZED,
    default: errorsByCode.WORKFLOW_UPDATE
  },
  WORKFLOWS_LOAD: {
    401: 'You don\'t have permission to view these workflows',
    default: 'Something\'s wrong, unable to load workflows. Try refreshing your browser'
  },
  STORAGE_CREATE: {
    default: errorsByCode.STORAGE_CREATE
  },
  STORAGE_GET: {
    default: errorsByCode.STORAGE_GET
  },
  STORAGE_DELETE: {
    401: 'You don\'t have permission to delete this storage',
    default: 'Your storage hasn\'t successfully been deleted. Check for errors or contact support'
  },
  STORAGE_UPDATE: {
    401: 'You don\'t have permission to update this storage',
    default: 'Something\'s wrong, cannot update this storage. Check for any errors'
  },
  SAVE_SSO_CONFIG: {
    default: errorsByCode.SAVE_SSO_CONFIG
  },
  LOAD_SSO_CONFIG: {
    default: errorsByCode.LOAD_SSO_CONFIG
  },
  ANNOTATION_CREATE: {
    401: errorsByCode.ANNOTATION_CREATE_NOT_AUTHORIZED,
    default: errorsByCode.ANNOTATION_CREATE
  },
  ANNOTATION_UPDATE: {
    401: errorsByCode.ANNOTATION_UPDATE_NOT_AUTHORIZED,
    default: errorsByCode.ANNOTATION_UPDATE
  },
  ANNOTATION_DELETE: {
    401: errorsByCode.ANNOTATION_DELETE_NOT_AUTHORIZED,
    default: errorsByCode.ANNOTATION_DELETE
  },
  /* eslint-enable max-len */
}
