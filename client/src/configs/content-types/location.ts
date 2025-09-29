import { ContentTypeFormConfig } from '../../components/forms/types';
import { LOCATION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const locationConfig: ContentTypeFormConfig = {
  title: "Location Creator", 
  description: "Create detailed locations for your world",
  icon: "MapPin",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "MapPin",
      fields: [
        Fields.createNameField("location"),
        Fields.createNotebookField(),
        Fields.createTypeField("location", LOCATION_TYPES),
        Fields.createDescriptionField("location"),
        ...Fields.createGeographicFields()
      ]
    },
    {
      id: "society",
      label: "Society & Culture",
      icon: "Users",
      fields: Fields.createSocietyFields()
    },
    {
      id: "features",
      label: "Features & History",
      icon: "BookOpen",
      fields: [
        Fields.createHistoryField("location"),
        Fields.createNotableFeaturesField(),
        Fields.createLandmarksField(),
        Fields.createThreatsField(),
        Fields.createResourcesField()
      ]
    }
  ]
};

export default locationConfig;