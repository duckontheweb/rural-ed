CREATE TABLE co_district_layer_02232017
AS
(
  SELECT * FROM raw.co_school_districts AS a
  LEFT JOIN raw.rural_district_data ON join_name = district
)

--

CREATE TABLE co_district_layer_03272017
AS
(
  SELECT gid
    , lgname
    , b.total_students
    , b.total_minorities
    , b.per_minorities
    , b.rural_des
    , b.total_free_reduced
    , b.per_free_reduced
    , b.link
    , c.school_week
  FROM raw.co_school_districts AS a
  LEFT JOIN raw.rural_district_data AS b ON join_name = district
  LEFT JOIN raw.rural_district_data_school_week AS c USING (link)
)
