# Stage 1: build
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app
# copy only what we need to leverage Docker cache
COPY backend/pom.xml ./ 
COPY backend/src ./src
RUN mvn -B -f pom.xml -DskipTests package

# Stage 2: runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
# copy jar from build stage (adjust if your artifactId/version differs)
COPY --from=build /app/target/*.jar app.jar

# Expose port (not strictly required, but helpful)
EXPOSE 8080

# Use Render's $PORT at runtime so app binds correctly.
# Note: Render will supply $PORT env; we pass it as -Dserver.port
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]