CREATE TABLE co_district_layer_02232017
AS
(
  SELECT * FROM raw.co_school_districts AS a
  LEFT JOIN raw.rural_district_data ON join_name = district
)
