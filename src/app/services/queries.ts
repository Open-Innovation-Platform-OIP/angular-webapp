import gql from "graphql-tag";

export const GetNotificationQuery = gql`
  query {
    notifications(where: { user_id: { _eq: "45" } }) {
      user_id
      is_update
      problem_id
      timestamp
    }
  }
`;

export const GetQuery = gql`
  query PostsGetQuery {
    problems {
      id
      title
      description
      location
      resources_needed
      image_urls

      is_deleted
    }
  }
`;

export const GetEnrichments = gql`
  query PostsGetQuery {
    enrichments {
      id
      description
      location
      resources_needed
      image_urls
      video_urls
      impact
      extent
      min_population

      beneficiary_attributes
      organization
    }
  }
`;

export const GetUsers = gql`
  query PostsGetQuery {
    users {
      id
      name
      organization
      location
      qualification
      personas
      photo_url
      expertise
    }
  }
`;
export const addDiscussions = gql`
  mutation insert_discussions($objects: [discussions_insert_input!]!) {
    insert_discussions(objects: $objects) {
      returning {
        id
        comment
        problem_id
      }
    }
  }
`;

export const AddMutation = gql`
  mutation insert_problems($objects: [problems_insert_input!]!) {
    insert_problems(objects: $objects) {
      returning {
        id
        title
      }
    }
  }
`;

export const AddUser = gql`
  mutation insert_users($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        name
      }
    }
  }
`;

export const UpdateUser = gql`
  mutation updateMutation($where: users_bool_exp!, $set: users_set_input!) {
    update_users(where: $where, _set: $set) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;

export const UpdateMutation = gql`
  mutation updateMutation(
    $where: problems_bool_exp!
    $set: problems_set_input!
  ) {
    update_problems(where: $where, _set: $set) {
      affected_rows
      returning {
        id
        title
      }
    }
  }
`;

export const DeleteProblemMutation = gql`
  mutation updateMutation(
    $where: problems_bool_exp!
    $set: problems_set_input!
  ) {
    update_problems(where: $where, _set: $set) {
      affected_rows
      returning {
        id
        title
      }
    }
  }
`;

export const DeleteEnrichmentMutation = gql`
  mutation DeleteMutation($where: enrichments_bool_exp!) {
    delete_enrichments(where: $where) {
      affected_rows
      returning {
        problem_id
      }
    }
  }
`;

export const AddEnrichment = gql`
  mutation insert_enrichments($objects: [enrichments_insert_input!]!) {
    insert_enrichments(objects: $objects) {
      returning {
        id
      }
    }
  }
`;

export const AddValidation = gql`
  mutation insert_validations($objects: [validations_insert_input!]!) {
    insert_validations(objects: $objects) {
      returning {
        validated_by
      }
    }
  }
`;

export const UpdateValidation = gql`
  mutation updateMutation(
    $where: validations_bool_exp!
    $set: validations_set_input!
  ) {
    update_validations(where: $where, _set: $set) {
      affected_rows
      returning {
        edited_at
      }
    }
  }
`;

export const UpdateCollaboration = gql`
  mutation updateMutation(
    $where: collaborators_bool_exp!
    $set: collaborators_set_input!
  ) {
    update_collaborators(where: $where, _set: $set) {
      affected_rows
      returning {
        user_id
      }
    }
  }
`;

export const DeleteValidation = gql`
  mutation DeleteMutation($where: validations_bool_exp!) {
    delete_validations(where: $where) {
      affected_rows
      returning {
        problem_id
      }
    }
  }
`;

export const AddCollaborator = gql`
  mutation insert_collaborators($objects: [collaborators_insert_input!]!) {
    insert_collaborators(objects: $objects) {
      returning {
        user_id
      }
    }
  }
`;

export const DeleteCollaboration = gql`
  mutation DeleteMutation($where: collaborators_bool_exp!) {
    delete_collaborators(where: $where) {
      affected_rows
      returning {
        problem_id
      }
    }
  }
`;

export const UpdateEnrichment = gql`
  mutation updateMutation(
    $where: enrichments_bool_exp!
    $set: enrichments_set_input!
  ) {
    update_enrichments(where: $where, _set: $set) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

// export const updateFields = gql`
//   mutation update_Problems($value: jsonb) {
//     update_article($where: Problems_bool_exp!
//      _append: { enrichment: $value }) {
//       affected_rows
//       returning {
//         id
//         enrichment
//       }
//     }
//   }
// `;
