import ProjectTypes "../types/project-types";
import Data "../data/project-categories";

module {
  public func getCategories() : [ProjectTypes.ProjectCategory] {
    Data.all;
  };

  public func getCategory(id : Text) : ?ProjectTypes.ProjectCategory {
    var result : ?ProjectTypes.ProjectCategory = null;
    for (cat in Data.all.values()) {
      if (cat.id == id) { result := ?cat };
    };
    result;
  };

  public func getSubtopic(categoryId : Text, subtopicId : Text) : ?ProjectTypes.ProjectSubtopic {
    switch (getCategory(categoryId)) {
      case null { null };
      case (?cat) {
        var found : ?ProjectTypes.ProjectSubtopic = null;
        for (st in cat.subtopics.values()) {
          if (st.id == subtopicId) { found := ?st };
        };
        found;
      };
    };
  };
};
